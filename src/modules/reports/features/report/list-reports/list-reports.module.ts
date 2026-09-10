import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { ListReportsController } from './list-reports.controller';
import { ListReportsHandler } from './list-reports.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [ListReportsController],
  providers: [ListReportsHandler],
  exports: [ListReportsHandler],
})
export class ListReportsModule {}
