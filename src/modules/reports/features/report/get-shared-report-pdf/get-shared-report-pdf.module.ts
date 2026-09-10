import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from '../../../infrastructure/database/reports-database.module';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { ReportPdfModule } from '../../../infrastructure/pdf/report-pdf.module';
import { GetSharedReportPdfController } from './get-shared-report-pdf.controller';
import { GetSharedReportPdfHandler } from './get-shared-report-pdf.handler';

@Module({
  imports: [
    ReportsDatabaseModule,
    LabsDatabaseModule,
    ReferralsDatabaseModule,
    ReportPdfModule,
  ],
  controllers: [GetSharedReportPdfController],
  providers: [GetSharedReportPdfHandler],
  exports: [GetSharedReportPdfHandler],
})
export class GetSharedReportPdfModule {}
