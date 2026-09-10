import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { CreateDoctorController } from './create-doctor.controller';
import { CreateDoctorHandler } from './create-doctor.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [CreateDoctorController],
  providers: [CreateDoctorHandler],
  exports: [CreateDoctorHandler],
})
export class CreateDoctorModule {}
