import { Inject, Injectable } from '@nestjs/common';
import { ListDoctorLedgerQuery } from './list-doctor-ledger.query';
import { DoctorCommissionLedger } from 'src/modules/referrals/domain/commission/doctor-commission-ledger.entity';
import {
  ICommissionLedgerRepository,
  COMMISSION_LEDGER_REPOSITORY_TOKEN,
  IDoctorBalance,
} from 'src/modules/referrals/domain/commission/interfaces/commission-ledger-repository.interface';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

export interface DoctorLedgerResponse {
  doctor: {
    id: string;
    name: string;
    clinic: string | null;
  };
  balance: IDoctorBalance;
  entries: DoctorCommissionLedger[];
}

@Injectable()
export class ListDoctorLedgerHandler {
  constructor(
    @Inject(COMMISSION_LEDGER_REPOSITORY_TOKEN)
    private readonly ledgerRepository: ICommissionLedgerRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(query: ListDoctorLedgerQuery): Promise<DoctorLedgerResponse> {
    const { doctorId, labId, status } = query;

    const doctor = await this.doctorRepository.findById(doctorId, labId);
    if (!doctor) {
      throw new EntityNotFoundException('ReferringDoctor', doctorId);
    }

    const [entries, balance] = await Promise.all([
      this.ledgerRepository.findByDoctorId(labId, doctorId, status),
      this.ledgerRepository.getDoctorBalance(labId, doctorId),
    ]);

    return {
      doctor: {
        id: doctor.id,
        name: doctor.name,
        clinic: doctor.clinic,
      },
      balance,
      entries,
    };
  }
}
