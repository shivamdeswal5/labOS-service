import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { UpdateDoctorController } from './update-doctor.controller';
import { UpdateDoctorHandler } from './update-doctor.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [UpdateDoctorController],
  providers: [UpdateDoctorHandler],
  exports: [UpdateDoctorHandler],
})
export class UpdateDoctorModule {}
