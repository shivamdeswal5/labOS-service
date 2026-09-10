import { CommissionStatusEnum } from 'src/modules/referrals/domain/commission/enums/commission-status.enum';

export class ListDoctorLedgerQuery {
  constructor(
    public readonly doctorId: string,
    public readonly labId: string,
    public readonly status?: CommissionStatusEnum,
  ) {}
}
