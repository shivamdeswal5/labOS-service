import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportFinalizedEvent } from 'src/modules/reports/events/report-finalized.event';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';
import { InvoiceItem } from 'src/modules/billing/domain/invoice/invoice-item.entity';

@Injectable()
export class ReportFinalizedBillingListener {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  @OnEvent('report.finalized')
  async handleReportFinalized(event: ReportFinalizedEvent): Promise<void> {
    const existing = await this.invoiceRepository.findByReportId(
      event.reportId,
      event.labId,
    );
    if (existing) {
      return;
    }

    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber(
      event.labId,
    );

    const price = Number(event.totalPrice) || 0;
    const item: Partial<InvoiceItem> = {
      description: `Diagnostic Pathology Services — Report ${event.reportNumber}`,
      unitPrice: price,
      quantity: 1,
      total: price,
    };

    await this.invoiceRepository.create({
      labId: event.labId,
      patientId: event.patientId,
      reportId: event.reportId,
      invoiceNumber,
      subtotal: price,
      discount: 0,
      totalAmount: price,
      paidAmount: 0,
      paymentStatus: PaymentStatusEnum.UNPAID,
      paymentMethod: null,
      paidAt: null,
      notes: `Auto-generated invoice for Report ${event.reportNumber}`,
      items: [item as InvoiceItem],
    });
  }
}
