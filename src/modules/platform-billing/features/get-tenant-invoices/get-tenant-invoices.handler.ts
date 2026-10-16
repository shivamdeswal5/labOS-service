import { Inject, Injectable } from '@nestjs/common';
import { GetTenantInvoicesQuery } from './get-tenant-invoices.query';
import { TenantInvoiceDto } from './get-tenant-invoices.dto';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/payment/interfaces/payment-repository.interface';

@Injectable()
export class GetTenantInvoicesHandler {
  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(query: GetTenantInvoicesQuery): Promise<TenantInvoiceDto[]> {
    const invoices = await this.paymentRepo.findInvoicesByLabId(query.labId);

    return invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amountInr: Number(inv.amountInr),
      subtotalInr: Number(inv.subtotalInr),
      taxAmountInr: Number(inv.taxAmountInr),
      customerGstin: inv.customerGstin,
      billingPeriodStart: inv.billingPeriodStart ? new Date(inv.billingPeriodStart).toISOString() : '',
      billingPeriodEnd: inv.billingPeriodEnd ? new Date(inv.billingPeriodEnd).toISOString() : '',
      pdfUrl: inv.pdfUrl,
      status: inv.status,
      createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
      paymentMethod: inv.payment?.paymentMethod || 'ONLINE_PAYMENT',
      providerPaymentId: inv.payment?.providerPaymentId || inv.payment?.providerOrderId,
    }));
  }
}
