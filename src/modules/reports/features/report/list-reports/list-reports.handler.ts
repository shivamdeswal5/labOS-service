import { Inject, Injectable } from '@nestjs/common';
import { ListReportsQuery } from './list-reports.query';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';

@Injectable()
export class ListReportsHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(query: ListReportsQuery): Promise<Report[]> {
    if (query.patientId) {
      return this.reportRepository.findByPatientId(query.labId, query.patientId);
    }
    return this.reportRepository.findByLabId(query.labId, query.status);
  }
}
