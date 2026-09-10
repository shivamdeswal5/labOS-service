import { Inject, Injectable } from '@nestjs/common';
import { DeleteReportCommand } from './delete-report.command';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainForbiddenException } from 'src/modules/shared/domain/exceptions/domain-forbidden.exception';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';

@Injectable()
export class DeleteReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(command: DeleteReportCommand): Promise<void> {
    const { reportId, labId } = command;

    const report = await this.reportRepository.findById(reportId, labId);
    if (!report) {
      throw new EntityNotFoundException('Report', reportId);
    }

    if (report.status === ReportStatusEnum.FINALIZED) {
      throw new DomainForbiddenException('Finalized reports cannot be deleted — use amendment instead');
    }

    const deleted = await this.reportRepository.softDelete(reportId, labId);
    if (!deleted) {
      throw new EntityNotFoundException('Report', reportId);
    }
  }
}
