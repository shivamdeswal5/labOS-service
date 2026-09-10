import { CreateReportDto } from './create-report.dto';

export class CreateReportCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreateReportDto,
  ) {}
}
