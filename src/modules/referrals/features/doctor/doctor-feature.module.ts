import { Module } from '@nestjs/common';
import { CreateDoctorModule } from './create-doctor/create-doctor.module';
import { GetDoctorModule } from './get-doctor/get-doctor.module';
import { ListDoctorsModule } from './list-doctors/list-doctors.module';
import { UpdateDoctorModule } from './update-doctor/update-doctor.module';
import { DeleteDoctorModule } from './delete-doctor/delete-doctor.module';

@Module({
  imports: [
    CreateDoctorModule,
    GetDoctorModule,
    ListDoctorsModule,
    UpdateDoctorModule,
    DeleteDoctorModule,
  ],
  exports: [
    CreateDoctorModule,
    GetDoctorModule,
    ListDoctorsModule,
    UpdateDoctorModule,
    DeleteDoctorModule,
  ],
})
export class DoctorFeatureModule {}
