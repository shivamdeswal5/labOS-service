import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { CreateReportCommand } from './create-report.command';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { ReportPanel } from 'src/modules/reports/domain/report/report-panel.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import { InvoiceItem } from 'src/modules/billing/domain/invoice/invoice-item.entity';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { EntityConflictException } from 'src/modules/shared/domain/exceptions/entity-conflict.exception';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';
import { SampleStatusEnum } from 'src/modules/reports/domain/report/enums/sample-status.enum';

@Injectable()
export class CreateReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateReportCommand): Promise<Report> {
    const { labId, dto } = command;

    const patient = await this.patientRepository.findById(dto.patientId, labId);
    if (!patient) {
      throw new EntityNotFoundException('Patient', dto.patientId);
    }

    let reportNumber = dto.reportNumber?.trim();
    if (!reportNumber) {
      reportNumber = await this.reportRepository.generateNextReportNumber(labId);
    } else {
      const reports = await this.reportRepository.findByLabId(labId);
      const reportNumberTaken = reports.some((r) => r.reportNumber === reportNumber);
      if (reportNumberTaken) {
        throw new EntityConflictException(`Report number '${reportNumber}' already exists in this lab`);
      }
    }

    const shareToken = randomBytes(32).toString('hex');

    return this.dataSource.transaction(async (manager) => {
      const report = manager.create(Report, {
        labId,
        patientId: dto.patientId,
        reportNumber,
        refByDoctorId: dto.refByDoctorId ?? null,
        status: ReportStatusEnum.DRAFT,
        sampleStatus: SampleStatusEnum.COLLECTED,
        remarks: dto.remarks ?? null,
        shareToken,
        sampleCollectedAt: new Date(),
      });
      const savedReport = await manager.save(report);

      for (const panelId of dto.panelIds) {
        const reportPanel = manager.create(ReportPanel, {
          reportId: savedReport.id,
          panelId,
        });
        await manager.save(reportPanel);
      }

      const reportWithPanels = await manager.findOneOrFail(Report, {
        where: { id: savedReport.id },
        relations: {
          patient: true,
          reportPanels: { panel: true },
        },
      });

      // ─── ORDER-TO-CASH INVOICING ───────────────────────────────────────────────
      // Generate sequential invoice number within this transaction
      const year = new Date().getFullYear();
      const count = await manager.count(Invoice, { where: { labId } });
      let seq = count + 1;
      let invoiceNumber = `INV-${year}-${String(seq).padStart(4, '0')}`;
      while (await manager.findOne(Invoice, { where: { labId, invoiceNumber } })) {
        seq += 1;
        invoiceNumber = `INV-${year}-${String(seq).padStart(4, '0')}`;
      }

      let subtotal = 0;
      const invoiceItems: Partial<InvoiceItem>[] = [];

      for (const rp of reportWithPanels.reportPanels) {
        const itemPrice = Number(rp.panel?.price) || 0;
        subtotal += itemPrice;
        invoiceItems.push({
          description: rp.panel?.name || 'Diagnostic Investigation Panel',
          unitPrice: itemPrice,
          quantity: 1,
          total: itemPrice,
        });
      }

      const discount = Number(dto.billing?.discount) || 0;
      const totalAmount = Math.max(0, subtotal - discount);

      // Determine upfront payment status
      const paymentMethod = dto.billing?.paymentMethod ?? null;
      const isPaidUpfront =
        dto.billing?.paymentStatus === PaymentStatusEnum.PAID ||
        (paymentMethod !== null && dto.billing?.paymentStatus !== PaymentStatusEnum.UNPAID);

      const paidAmount = isPaidUpfront
        ? (Number(dto.billing?.paidAmount) || totalAmount)
        : (Number(dto.billing?.paidAmount) || 0);

      let paymentStatus = PaymentStatusEnum.UNPAID;
      if (paidAmount >= totalAmount && totalAmount > 0) {
        paymentStatus = PaymentStatusEnum.PAID;
      } else if (paidAmount > 0) {
        paymentStatus = PaymentStatusEnum.PARTIALLY_PAID;
      }

      const paidAt = isPaidUpfront && paidAmount > 0 ? new Date() : null;

      // Save invoice inside the same transaction manager so savedReport.id is visible
      const invoiceEntity = manager.create(Invoice, {
        labId,
        patientId: dto.patientId,
        reportId: savedReport.id,
        invoiceNumber,
        subtotal,
        discount,
        totalAmount,
        paidAmount,
        paymentStatus,
        paymentMethod: isPaidUpfront ? paymentMethod : null,
        paidAt,
        notes: dto.billing?.notes ?? `Auto-generated intake invoice for Report ${reportNumber}`,
      });
      const savedInvoice = await manager.save(Invoice, invoiceEntity);

      for (const item of invoiceItems) {
        const itemEntity = manager.create(InvoiceItem, {
          ...item,
          invoiceId: savedInvoice.id,
        });
        await manager.save(InvoiceItem, itemEntity);
      }

      const loadedInvoice = await manager.findOne(Invoice, {
        where: { id: savedInvoice.id },
        relations: { items: true },
      });

      (reportWithPanels as unknown as { invoice: unknown }).invoice = loadedInvoice;
      return reportWithPanels;
    });
  }
}
