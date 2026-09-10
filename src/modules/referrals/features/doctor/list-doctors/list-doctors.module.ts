import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { ListDoctorsController } from './list-doctors.controller';
import { ListDoctorsHandler } from './list-doctors.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [ListDoctorsController],
  providers: [ListDoctorsHandler],
  exports: [ListDoctorsHandler],
})
export class ListDoctorsModule {}
