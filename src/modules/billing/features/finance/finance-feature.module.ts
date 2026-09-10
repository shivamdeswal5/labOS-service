import { Module } from '@nestjs/common';
import { GetFinancialSummaryModule } from './get-financial-summary/get-financial-summary.module';

@Module({
  imports: [GetFinancialSummaryModule],
  exports: [GetFinancialSummaryModule],
})
export class FinanceFeatureModule {}
