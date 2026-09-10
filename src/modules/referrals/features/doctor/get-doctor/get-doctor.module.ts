import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { GetDoctorController } from './get-doctor.controller';
import { GetDoctorHandler } from './get-doctor.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [GetDoctorController],
  providers: [GetDoctorHandler],
  exports: [GetDoctorHandler],
})
export class GetDoctorModule {}
