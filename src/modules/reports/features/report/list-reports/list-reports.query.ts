import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';

export class ListReportsQuery {
  constructor(
    public readonly labId: string,
    public readonly status?: ReportStatusEnum,
    public readonly patientId?: string,
  ) {}
}
