import { Inject, Injectable } from '@nestjs/common';
import { RecordManualCommissionCommand } from './record-manual-commission.command';
import { DoctorCommissionLedger } from 'src/modules/referrals/domain/commission/doctor-commission-ledger.entity';
import {
  ICommissionLedgerRepository,
  COMMISSION_LEDGER_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/commission/interfaces/commission-ledger-repository.interface';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { CommissionStatusEnum } from 'src/modules/referrals/domain/commission/enums/commission-status.enum';

@Injectable()
export class RecordManualCommissionHandler {
  constructor(
    @Inject(COMMISSION_LEDGER_REPOSITORY_TOKEN)
    private readonly ledgerRepository: ICommissionLedgerRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(
    command: RecordManualCommissionCommand,
  ): Promise<DoctorCommissionLedger> {
    const { labId, dto } = command;

    const doctor = await this.doctorRepository.findById(dto.doctorId, labId);
    if (!doctor) {
      throw new EntityNotFoundException('ReferringDoctor', dto.doctorId);
    }

    return this.ledgerRepository.create({
      labId,
      doctorId: dto.doctorId,
      reportId: null,
      amount: dto.amount,
      status: CommissionStatusEnum.PENDING,
      notes: dto.notes,
    });
  }
}
