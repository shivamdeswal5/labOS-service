import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import {
  IInvoiceRepository,
  FindInvoicesFilter,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import {
  PaymentStatusEnum,
  PaymentStatusEnumMapper,
} from 'src/modules/billing/domain/invoice/enums/payment-status.enum';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    private readonly dataSource: DataSource,
  ) { }

  private async hydratePatientDetails(invoices: Invoice[]): Promise<Invoice[]> {
    if (invoices.length === 0) return invoices;

    const patientIds = [
      ...new Set(invoices.map((inv) => inv.patientId).filter(Boolean)),
    ];
    if (patientIds.length === 0) return invoices;

    try {
      const patients = await this.dataSource
        .getRepository(Patient)
        .findBy({ id: In(patientIds) });
      const patientMap = new Map(patients.map((p) => [p.id, p]));

      for (const inv of invoices) {
        const patient = patientMap.get(inv.patientId);
        (inv as any).patient = patient || null;
        (inv as any).patientName = patient?.name || 'Unknown Patient';
        (inv as any).patientMrn = patient?.patientNumber || 'PT-XXXX';
        (inv as any).patientPhone = patient?.phone || '';
        (inv as any).testsBilled =
          inv.items && inv.items.length > 0
            ? inv.items.map((it) => it.description).join(', ')
            : 'Diagnostic Investigation Panel';
      }
    } catch {
      // In case patient lookup fails, fallback gracefully without crashing
      for (const inv of invoices) {
        (inv as any).patientName = (inv as any).patientName || 'Patient';
        (inv as any).patientMrn = (inv as any).patientMrn || 'PT-XXXX';
        (inv as any).testsBilled =
          inv.items && inv.items.length > 0
            ? inv.items.map((it) => it.description).join(', ')
            : 'Diagnostic Investigation Panel';
      }
    }

    return invoices;
  }

  async findById(id: string, labId: string): Promise<Invoice | null> {
    const inv = await this.invoiceRepo.findOne({
      where: { id, labId },
      relations: { items: true },
    });
    if (!inv) return null;
    const hydrated = await this.hydratePatientDetails([inv]);
    return hydrated[0];
  }

  async findByReportId(reportId: string, labId: string): Promise<Invoice | null> {
    const inv = await this.invoiceRepo.findOne({
      where: { reportId, labId },
      relations: { items: true },
    });
    if (!inv) return null;
    const hydrated = await this.hydratePatientDetails([inv]);
    return hydrated[0];
  }

  async findByLabId(
    labId: string,
    filter?: FindInvoicesFilter,
  ): Promise<Invoice[]> {
    const query = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.lab_id = :labId', { labId })
      .andWhere('invoice.deleted_at IS NULL');

    if (filter?.status !== undefined) {
      const statusVal =
        typeof filter.status === 'string'
          ? (PaymentStatusEnumMapper[filter.status as PaymentStatusEnum] ??
            filter.status)
          : filter.status;
      query.andWhere('invoice.payment_status = :status', { status: statusVal });
    }

    if (filter?.patientId) {
      query.andWhere('invoice.patient_id = :patientId', {
        patientId: filter.patientId,
      });
    }

    if (filter?.reportId) {
      query.andWhere('invoice.report_id = :reportId', {
        reportId: filter.reportId,
      });
    }

    const invoices = await query
      .orderBy('invoice.created_at', 'DESC')
      .getMany();

    return this.hydratePatientDetails(invoices);
  }

  async save(invoice: Invoice): Promise<Invoice> {
    return this.invoiceRepo.save(invoice);
  }

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.invoiceRepo.create(data);
    return this.invoiceRepo.save(invoice);
  }

  async generateInvoiceNumber(labId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .where('invoice.lab_id = :labId', { labId })
      .getCount();

    let seq = count + 1;
    let candidate = `INV-${year}-${String(seq).padStart(4, '0')}`;
    while (await this.invoiceRepo.findOne({ where: { labId, invoiceNumber: candidate } })) {
      seq += 1;
      candidate = `INV-${year}-${String(seq).padStart(4, '0')}`;
    }
    return candidate;
  }
}
