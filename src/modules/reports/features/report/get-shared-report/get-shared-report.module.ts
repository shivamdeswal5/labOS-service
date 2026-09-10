import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { GetSharedReportController } from './get-shared-report.controller';
import { GetSharedReportHandler } from './get-shared-report.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [GetSharedReportController],
  providers: [GetSharedReportHandler],
  exports: [GetSharedReportHandler],
})
export class GetSharedReportModule {}
