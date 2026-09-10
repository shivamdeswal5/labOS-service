import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { FinalizeReportController } from './finalize-report.controller';
import { FinalizeReportHandler } from './finalize-report.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [FinalizeReportController],
  providers: [FinalizeReportHandler],
  exports: [FinalizeReportHandler],
})
export class FinalizeReportModule {}
