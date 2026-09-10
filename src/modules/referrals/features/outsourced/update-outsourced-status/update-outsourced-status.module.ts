import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { UpdateOutsourcedStatusController } from './update-outsourced-status.controller';
import { UpdateOutsourcedStatusHandler } from './update-outsourced-status.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [UpdateOutsourcedStatusController],
  providers: [UpdateOutsourcedStatusHandler],
  exports: [UpdateOutsourcedStatusHandler],
})
export class UpdateOutsourcedStatusModule {}
