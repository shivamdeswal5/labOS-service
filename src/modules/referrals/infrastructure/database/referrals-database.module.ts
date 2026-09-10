import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import { DoctorCommissionLedger } from 'src/modules/referrals/domain/commission/doctor-commission-ledger.entity';
import { OutsourcedTest } from 'src/modules/referrals/domain/outsourced/outsourced-test.entity';
import { DOCTOR_REPOSITORY_TOKEN } from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { COMMISSION_LEDGER_REPOSITORY_TOKEN } from 'src/modules/referrals/domain/commission/interfaces/commission-ledger-repository.interface';
import { OUTSOURCED_TEST_REPOSITORY_TOKEN } from 'src/modules/referrals/domain/outsourced/interfaces/outsourced-test-repository.interface';
import { DoctorRepository } from './repositories/doctor.repository';
import { CommissionLedgerRepository } from './repositories/commission-ledger.repository';
import { OutsourcedTestRepository } from './repositories/outsourced-test.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReferringDoctor,
      DoctorCommissionLedger,
      OutsourcedTest,
    ]),
  ],
  providers: [
    {
      provide: DOCTOR_REPOSITORY_TOKEN,
      useClass: DoctorRepository,
    },
    {
      provide: COMMISSION_LEDGER_REPOSITORY_TOKEN,
      useClass: CommissionLedgerRepository,
    },
    {
      provide: OUTSOURCED_TEST_REPOSITORY_TOKEN,
      useClass: OutsourcedTestRepository,
    },
  ],
  exports: [
    DOCTOR_REPOSITORY_TOKEN,
    COMMISSION_LEDGER_REPOSITORY_TOKEN,
    OUTSOURCED_TEST_REPOSITORY_TOKEN,
  ],
})
export class ReferralsDatabaseModule {}
