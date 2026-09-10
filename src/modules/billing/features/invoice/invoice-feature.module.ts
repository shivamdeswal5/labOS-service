import { Module } from '@nestjs/common';
import { CreateInvoiceModule } from './create-invoice/create-invoice.module';
import { GetInvoiceModule } from './get-invoice/get-invoice.module';
import { ListInvoicesModule } from './list-invoices/list-invoices.module';
import { RecordPaymentModule } from './record-payment/record-payment.module';

@Module({
  imports: [
    CreateInvoiceModule,
    GetInvoiceModule,
    ListInvoicesModule,
    RecordPaymentModule,
  ],
  exports: [
    CreateInvoiceModule,
    GetInvoiceModule,
    ListInvoicesModule,
    RecordPaymentModule,
  ],
})
export class InvoiceFeatureModule {}
