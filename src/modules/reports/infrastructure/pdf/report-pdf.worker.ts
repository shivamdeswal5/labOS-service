import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  PgBossService,
  QUEUE_NAMES,
} from 'src/modules/shared/infrastructure/queue/pg-boss.service';
import { GetReportPdfHandler } from '../../features/report/get-report-pdf/get-report-pdf.handler';

export interface ReportPdfJobData {
  reportId: string;
  labId: string;
  reportNumber: string;
}

@Injectable()
export class ReportPdfWorker implements OnModuleInit {
  private readonly logger = new Logger(ReportPdfWorker.name);

  constructor(
    private readonly queueService: PgBossService,
    private readonly getReportPdfHandler: GetReportPdfHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queueService.registerWorker<ReportPdfJobData>(
      QUEUE_NAMES.REPORT_FINALIZED_PDF,
      async ({ id, data }) => {
        const start = Date.now();
        this.logger.log(
          `[pg-boss] Processing PDF pre-compilation for Report [${data.reportNumber}] (Job ${id})`,
        );

        try {
          const result = await this.getReportPdfHandler.execute({
            reportId: data.reportId,
            labId: data.labId,
          });

          const duration = Date.now() - start;
          this.logger.log(
            `[pg-boss] Successfully rendered PDF for Report [${result.reportNumber}] in ${duration}ms (${result.buffer.length} bytes)`,
          );
        } catch (error: any) {
          this.logger.error(
            `[pg-boss] Failed to pre-render PDF for Report [${data.reportNumber}]: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      },
    );
  }
}
