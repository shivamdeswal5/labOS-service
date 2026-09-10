import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportFinalizedEvent } from 'src/modules/reports/events/report-finalized.event';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import {
  ICommissionLedgerRepository,
  COMMISSION_LEDGER_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/commission/interfaces/commission-ledger-repository.interface';
import { CommissionTypeEnum } from 'src/modules/referrals/domain/doctor/enums/commission-type.enum';
import { CommissionStatusEnum } from 'src/modules/referrals/domain/commission/enums/commission-status.enum';

@Injectable()
export class ReportFinalizedListener {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
    @Inject(COMMISSION_LEDGER_REPOSITORY_TOKEN)
    private readonly ledgerRepository: ICommissionLedgerRepository,
  ) {}

  @OnEvent('report.finalized')
  async handleReportFinalized(event: ReportFinalizedEvent): Promise<void> {
    if (!event.refByDoctorId) {
      return;
    }

    const doctor = await this.doctorRepository.findById(
      event.refByDoctorId,
      event.labId,
    );
    if (!doctor) {
      return;
    }

    let commissionAmount = 0;
    if (doctor.commissionType === CommissionTypeEnum.FLAT) {
      commissionAmount = Number(doctor.commissionValue);
    } else if (doctor.commissionType === CommissionTypeEnum.PERCENTAGE) {
      commissionAmount =
        (Number(event.totalPrice) * Number(doctor.commissionValue)) / 100;
    }

    if (
      commissionAmount <= 0 &&
      doctor.commissionType === CommissionTypeEnum.NONE
    ) {
      return;
    }

    await this.ledgerRepository.create({
      labId: event.labId,
      doctorId: doctor.id,
      reportId: event.reportId,
      amount: commissionAmount,
      status: CommissionStatusEnum.PENDING,
      notes: `Auto-generated commission for Report ${event.reportNumber}`,
    });
  }
}
