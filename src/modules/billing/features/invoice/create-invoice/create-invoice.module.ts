import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { CreateInvoiceController } from './create-invoice.controller';
import { CreateInvoiceHandler } from './create-invoice.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [CreateInvoiceController],
  providers: [CreateInvoiceHandler],
  exports: [CreateInvoiceHandler],
})
export class CreateInvoiceModule {}
