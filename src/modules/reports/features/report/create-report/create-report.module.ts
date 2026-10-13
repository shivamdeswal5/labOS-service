import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { PlatformBillingDatabaseModule } from 'src/modules/platform-billing/infrastructure/database/platform-billing-database.module';
import { SubscriptionIntakeGuard } from 'src/modules/platform-billing/guards/subscription-intake.guard';
import { CreateReportController } from './create-report.controller';
import { CreateReportHandler } from './create-report.handler';

@Module({
  imports: [ReportsDatabaseModule, BillingDatabaseModule, PlatformBillingDatabaseModule],
  controllers: [CreateReportController],
  providers: [CreateReportHandler, SubscriptionIntakeGuard],
  exports: [CreateReportHandler],
})
export class CreateReportModule {}

