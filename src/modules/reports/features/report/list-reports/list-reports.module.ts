import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { ListReportsController } from './list-reports.controller';
import { ListReportsHandler } from './list-reports.handler';

@Module({
  imports: [ReportsDatabaseModule, BillingDatabaseModule, ReferralsDatabaseModule],
  controllers: [ListReportsController],
  providers: [ListReportsHandler],
  exports: [ListReportsHandler],
})
export class ListReportsModule {}
