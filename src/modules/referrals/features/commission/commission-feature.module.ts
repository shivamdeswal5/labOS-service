import { Module } from '@nestjs/common';
import { ListDoctorLedgerModule } from './list-doctor-ledger/list-doctor-ledger.module';
import { SettleCommissionModule } from './settle-commission/settle-commission.module';
import { RecordManualCommissionModule } from './record-manual-commission/record-manual-commission.module';
import { GetCommissionSummaryModule } from './get-commission-summary/get-commission-summary.module';

@Module({
  imports: [
    ListDoctorLedgerModule,
    SettleCommissionModule,
    RecordManualCommissionModule,
    GetCommissionSummaryModule,
  ],
  exports: [
    ListDoctorLedgerModule,
    SettleCommissionModule,
    RecordManualCommissionModule,
    GetCommissionSummaryModule,
  ],
})
export class CommissionFeatureModule {}
