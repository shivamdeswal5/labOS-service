import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from '../../../infrastructure/database/reports-database.module';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { ReportPdfModule } from '../../../infrastructure/pdf/report-pdf.module';
import { GetReportPdfController } from './get-report-pdf.controller';
import { GetReportPdfHandler } from './get-report-pdf.handler';

@Module({
  imports: [
    ReportsDatabaseModule,
    LabsDatabaseModule,
    ReferralsDatabaseModule,
    ReportPdfModule,
  ],
  controllers: [GetReportPdfController],
  providers: [GetReportPdfHandler],
  exports: [GetReportPdfHandler],
})
export class GetReportPdfModule {}
