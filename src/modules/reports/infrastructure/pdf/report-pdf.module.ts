import { Module } from '@nestjs/common';
import { ReportPdfGeneratorService } from './report-pdf-generator.service';

@Module({
  providers: [ReportPdfGeneratorService],
  exports: [ReportPdfGeneratorService],
})
export class ReportPdfModule {}
