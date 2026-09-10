import { Inject, Injectable } from '@nestjs/common';
import { GetSharedReportQuery } from './get-shared-report.query';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainForbiddenException } from 'src/modules/shared/domain/exceptions/domain-forbidden.exception';

@Injectable()
export class GetSharedReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(query: GetSharedReportQuery): Promise<Report> {
    const { token } = query;

    const report = await this.reportRepository.findByShareToken(token);
    if (!report) {
      throw new EntityNotFoundException('Report', token);
    }

    if (report.shareExpiresAt && report.shareExpiresAt < new Date()) {
      throw new DomainForbiddenException('Report share link has expired');
    }

    return report;
  }
}
