import { Inject, Injectable } from '@nestjs/common';
import { GetDashboardStatsQuery } from './get-dashboard-stats.query';
import { DashboardStatsDto } from './get-dashboard-stats.dto';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';

@Injectable()
export class GetDashboardStatsHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(query: GetDashboardStatsQuery): Promise<DashboardStatsDto> {
    return this.reportRepository.getDashboardStats(query.labId);
  }
}
