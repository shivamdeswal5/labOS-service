import { Inject, Injectable } from '@nestjs/common';
import { GetReportQuery } from './get-report.query';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(query: GetReportQuery): Promise<Report> {
    const report = await this.reportRepository.findById(query.reportId, query.labId);
    if (!report) {
      throw new EntityNotFoundException('Report', query.reportId);
    }
    return report;
  }
}
