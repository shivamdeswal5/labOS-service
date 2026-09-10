import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { RecordManualCommissionController } from './record-manual-commission.controller';
import { RecordManualCommissionHandler } from './record-manual-commission.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [RecordManualCommissionController],
  providers: [RecordManualCommissionHandler],
  exports: [RecordManualCommissionHandler],
})
export class RecordManualCommissionModule {}
