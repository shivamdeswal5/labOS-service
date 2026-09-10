import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { DeleteDoctorController } from './delete-doctor.controller';
import { DeleteDoctorHandler } from './delete-doctor.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [DeleteDoctorController],
  providers: [DeleteDoctorHandler],
  exports: [DeleteDoctorHandler],
})
export class DeleteDoctorModule {}
