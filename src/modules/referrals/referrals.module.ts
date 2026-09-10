import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from './infrastructure/database/referrals-database.module';
import { DoctorFeatureModule } from './features/doctor/doctor-feature.module';
import { CommissionFeatureModule } from './features/commission/commission-feature.module';
import { OutsourcedFeatureModule } from './features/outsourced/outsourced-feature.module';
import { ReportFinalizedListener } from './listeners/report-finalized.listener';

@Module({
  imports: [
    ReferralsDatabaseModule,
    DoctorFeatureModule,
    CommissionFeatureModule,
    OutsourcedFeatureModule,
  ],
  providers: [ReportFinalizedListener],
  exports: [
    ReferralsDatabaseModule,
    DoctorFeatureModule,
    CommissionFeatureModule,
    OutsourcedFeatureModule,
  ],
})
export class ReferralsModule {}
