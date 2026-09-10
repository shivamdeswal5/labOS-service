import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { GetPatientController } from './get-patient.controller';
import { GetPatientHandler } from './get-patient.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [GetPatientController],
  providers: [GetPatientHandler],
  exports: [GetPatientHandler],
})
export class GetPatientModule {}
