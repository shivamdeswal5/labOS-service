import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { AmendReportController } from './amend-report.controller';
import { AmendReportHandler } from './amend-report.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [AmendReportController],
  providers: [AmendReportHandler],
  exports: [AmendReportHandler],
})
export class AmendReportModule {}
