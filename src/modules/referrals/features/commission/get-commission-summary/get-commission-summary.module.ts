import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { GetCommissionSummaryController } from './get-commission-summary.controller';
import { GetCommissionSummaryHandler } from './get-commission-summary.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [GetCommissionSummaryController],
  providers: [GetCommissionSummaryHandler],
  exports: [GetCommissionSummaryHandler],
})
export class GetCommissionSummaryModule {}
