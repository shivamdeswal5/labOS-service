import { Inject, Injectable } from '@nestjs/common';
import { FinalizeReportCommand } from './finalize-report.command';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainForbiddenException } from 'src/modules/shared/domain/exceptions/domain-forbidden.exception';
import { DomainValidationException } from 'src/modules/shared/domain/exceptions/domain-validation.exception';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';
import { SampleStatusEnum } from 'src/modules/reports/domain/report/enums/sample-status.enum';
import { ReportFinalizedEvent } from 'src/modules/reports/events/report-finalized.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FinalizeReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: FinalizeReportCommand): Promise<Report> {
    const { reportId, labId, finalizedByUserId } = command;

    const report = await this.reportRepository.findById(reportId, labId);
    if (!report) {
      throw new EntityNotFoundException('Report', reportId);
    }

    if (report.status === ReportStatusEnum.FINALIZED) {
      throw new DomainForbiddenException('Report is already finalized');
    }

    if (!report.values || report.values.length === 0) {
      throw new DomainValidationException('Cannot finalize a report with no results entered');
    }

    report.status = ReportStatusEnum.FINALIZED;
    report.sampleStatus = SampleStatusEnum.COMPLETED;
    report.finalizedAt = new Date();

    const finalized = await this.reportRepository.save(report);

    this.eventEmitter.emit(
      'report.finalized',
      new ReportFinalizedEvent(
        finalized.id,
        finalized.labId,
        finalized.patientId,
        finalized.refByDoctorId,
        finalized.reportNumber,
        finalized.finalizedAt!,
        finalizedByUserId,
        0,
      ),
    );

    return finalized;
  }
}
