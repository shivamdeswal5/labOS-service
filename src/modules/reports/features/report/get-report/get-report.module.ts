import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { GetReportController } from './get-report.controller';
import { GetReportHandler } from './get-report.handler';

@Module({
  imports: [ReportsDatabaseModule, BillingDatabaseModule, ReferralsDatabaseModule],
  controllers: [GetReportController],
  providers: [GetReportHandler],
  exports: [GetReportHandler],
})
export class GetReportModule {}
