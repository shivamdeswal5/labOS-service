import { AmendReportDto } from './amend-report.dto';

export class AmendReportCommand {
  constructor(
    public readonly reportId: string,
    public readonly labId: string,
    public readonly amendedByUserId: string,
    public readonly dto: AmendReportDto,
  ) {}
}
