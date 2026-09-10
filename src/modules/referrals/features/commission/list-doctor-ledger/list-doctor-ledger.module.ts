import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { ListDoctorLedgerController } from './list-doctor-ledger.controller';
import { ListDoctorLedgerHandler } from './list-doctor-ledger.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [ListDoctorLedgerController],
  providers: [ListDoctorLedgerHandler],
  exports: [ListDoctorLedgerHandler],
})
export class ListDoctorLedgerModule {}
