import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { SettleCommissionController } from './settle-commission.controller';
import { SettleCommissionHandler } from './settle-commission.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [SettleCommissionController],
  providers: [SettleCommissionHandler],
  exports: [SettleCommissionHandler],
})
export class SettleCommissionModule {}
