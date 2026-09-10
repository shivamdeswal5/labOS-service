import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { GetReportController } from './get-report.controller';
import { GetReportHandler } from './get-report.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [GetReportController],
  providers: [GetReportHandler],
  exports: [GetReportHandler],
})
export class GetReportModule {}
