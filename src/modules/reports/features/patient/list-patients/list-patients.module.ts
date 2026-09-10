import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { ListPatientsController } from './list-patients.controller';
import { ListPatientsHandler } from './list-patients.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [ListPatientsController],
  providers: [ListPatientsHandler],
  exports: [ListPatientsHandler],
})
export class ListPatientsModule {}
