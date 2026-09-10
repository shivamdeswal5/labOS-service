import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { CreatePatientController } from './create-patient.controller';
import { CreatePatientHandler } from './create-patient.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [CreatePatientController],
  providers: [CreatePatientHandler],
  exports: [CreatePatientHandler],
})
export class CreatePatientModule {}
