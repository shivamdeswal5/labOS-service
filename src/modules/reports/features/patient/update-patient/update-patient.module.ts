import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { UpdatePatientController } from './update-patient.controller';
import { UpdatePatientHandler } from './update-patient.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [UpdatePatientController],
  providers: [UpdatePatientHandler],
  exports: [UpdatePatientHandler],
})
export class UpdatePatientModule {}
