import { RecordManualCommissionDto } from './record-manual-commission.dto';

export class RecordManualCommissionCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: RecordManualCommissionDto,
  ) {}
}
