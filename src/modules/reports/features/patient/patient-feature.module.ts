import { Module } from '@nestjs/common';
import { CreatePatientModule } from './create-patient/create-patient.module';
import { GetPatientModule } from './get-patient/get-patient.module';
import { ListPatientsModule } from './list-patients/list-patients.module';
import { UpdatePatientModule } from './update-patient/update-patient.module';

@Module({
  imports: [CreatePatientModule, GetPatientModule, ListPatientsModule, UpdatePatientModule],
  exports: [CreatePatientModule, GetPatientModule, ListPatientsModule, UpdatePatientModule],
})
export class PatientFeatureModule {}
