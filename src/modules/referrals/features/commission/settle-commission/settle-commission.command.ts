import { SettleCommissionDto } from './settle-commission.dto';

export class SettleCommissionCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: SettleCommissionDto,
  ) {}
}
