import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { GetInvoiceController } from './get-invoice.controller';
import { GetInvoiceHandler } from './get-invoice.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [GetInvoiceController],
  providers: [GetInvoiceHandler],
  exports: [GetInvoiceHandler],
})
export class GetInvoiceModule {}
