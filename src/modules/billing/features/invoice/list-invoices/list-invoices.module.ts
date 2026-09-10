import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { ListInvoicesController } from './list-invoices.controller';
import { ListInvoicesHandler } from './list-invoices.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [ListInvoicesController],
  providers: [ListInvoicesHandler],
  exports: [ListInvoicesHandler],
})
export class ListInvoicesModule {}
