import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { DeleteReportController } from './delete-report.controller';
import { DeleteReportHandler } from './delete-report.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [DeleteReportController],
  providers: [DeleteReportHandler],
  exports: [DeleteReportHandler],
})
export class DeleteReportModule {}
