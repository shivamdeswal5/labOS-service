import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from './infrastructure/database/reports-database.module';
import { PatientFeatureModule } from './features/patient/patient-feature.module';
import { ReportFeatureModule } from './features/report/report-feature.module';
import { ReportFinalizedPdfListener } from './listeners/report-finalized-pdf.listener';
import { ReportPdfWorker } from './infrastructure/pdf/report-pdf.worker';

@Module({
  imports: [
    ReportsDatabaseModule,
    PatientFeatureModule,
    ReportFeatureModule,
  ],
  providers: [ReportFinalizedPdfListener, ReportPdfWorker],
  exports: [
    ReportsDatabaseModule,
    PatientFeatureModule,
    ReportFeatureModule,
  ],
})
export class ReportsModule {}
