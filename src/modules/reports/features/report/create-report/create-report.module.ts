import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { CreateReportController } from './create-report.controller';
import { CreateReportHandler } from './create-report.handler';

@Module({
  imports: [ReportsDatabaseModule, BillingDatabaseModule],
  controllers: [CreateReportController],
  providers: [CreateReportHandler],
  exports: [CreateReportHandler],
})
export class CreateReportModule {}
