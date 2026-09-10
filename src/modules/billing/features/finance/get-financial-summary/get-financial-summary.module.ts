import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { GetFinancialSummaryController } from './get-financial-summary.controller';
import { GetFinancialSummaryHandler } from './get-financial-summary.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [GetFinancialSummaryController],
  providers: [GetFinancialSummaryHandler],
  exports: [GetFinancialSummaryHandler],
})
export class GetFinancialSummaryModule {}
