import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportFinalizedEvent } from '../events/report-finalized.event';
import {
  PgBossService,
  QUEUE_NAMES,
} from 'src/modules/shared/infrastructure/queue/pg-boss.service';

@Injectable()
export class ReportFinalizedPdfListener {
  private readonly logger = new Logger(ReportFinalizedPdfListener.name);

  constructor(private readonly queueService: PgBossService) {}

  @OnEvent('report.finalized')
  async handleReportFinalized(event: ReportFinalizedEvent): Promise<void> {
    this.logger.log(
      `Report [${event.reportNumber}] finalized for Lab [${event.labId}]. Enqueueing async PDF render job...`,
    );

    await this.queueService.sendJob(QUEUE_NAMES.REPORT_FINALIZED_PDF, {
      reportId: event.reportId,
      labId: event.labId,
      reportNumber: event.reportNumber,
    });
  }
}
