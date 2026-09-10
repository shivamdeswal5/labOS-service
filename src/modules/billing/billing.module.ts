import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from './infrastructure/database/billing-database.module';
import { InvoiceFeatureModule } from './features/invoice/invoice-feature.module';
import { ExpenseFeatureModule } from './features/expense/expense-feature.module';
import { FinanceFeatureModule } from './features/finance/finance-feature.module';
import { ReportFinalizedBillingListener } from './listeners/report-finalized-billing.listener';

@Module({
  imports: [
    BillingDatabaseModule,
    InvoiceFeatureModule,
    ExpenseFeatureModule,
    FinanceFeatureModule,
  ],
  providers: [ReportFinalizedBillingListener],
  exports: [
    BillingDatabaseModule,
    InvoiceFeatureModule,
    ExpenseFeatureModule,
    FinanceFeatureModule,
  ],
})
export class BillingModule {}
