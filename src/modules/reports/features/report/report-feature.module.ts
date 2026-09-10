import { Module } from '@nestjs/common';
import { CreateReportModule } from './create-report/create-report.module';
import { GetDashboardStatsModule } from './get-dashboard-stats/get-dashboard-stats.module';
import { GetReportModule } from './get-report/get-report.module';
import { ListReportsModule } from './list-reports/list-reports.module';
import { EnterResultsModule } from './enter-results/enter-results.module';
import { FinalizeReportModule } from './finalize-report/finalize-report.module';
import { AmendReportModule } from './amend-report/amend-report.module';
import { DeleteReportModule } from './delete-report/delete-report.module';
import { GetSharedReportModule } from './get-shared-report/get-shared-report.module';
import { GetReportPdfModule } from './get-report-pdf/get-report-pdf.module';
import { GetSharedReportPdfModule } from './get-shared-report-pdf/get-shared-report-pdf.module';

@Module({
  imports: [
    CreateReportModule,
    GetDashboardStatsModule,
    GetReportModule,
    ListReportsModule,
    EnterResultsModule,
    FinalizeReportModule,
    AmendReportModule,
    DeleteReportModule,
    GetSharedReportModule,
    GetReportPdfModule,
    GetSharedReportPdfModule,
  ],
  exports: [
    CreateReportModule,
    GetDashboardStatsModule,
    GetReportModule,
    ListReportsModule,
    EnterResultsModule,
    FinalizeReportModule,
    AmendReportModule,
    DeleteReportModule,
    GetSharedReportModule,
    GetReportPdfModule,
    GetSharedReportPdfModule,
  ],
})
export class ReportFeatureModule {}
