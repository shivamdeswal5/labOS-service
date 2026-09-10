import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PgBoss } from 'pg-boss';

export interface EnqueueJobOptions {
  priority?: number;
  startAfter?: number | string | Date;
  retryLimit?: number;
  retryDelay?: number;
  expireInSeconds?: number;
}

export const QUEUE_NAMES = {
  REPORT_FINALIZED_PDF: 'report-finalized-pdf',
  SEND_NOTIFICATION: 'send-notification',
} as const;

@Injectable()
export class PgBossService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PgBossService.name);
  private boss: PgBoss | null = null;
  private started = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('DATABASE_HOST', 'localhost');
    const port = Number(this.configService.get<number>('DATABASE_PORT', 5432));
    const user = this.configService.get<string>('DATABASE_USERNAME', 'postgres');
    const password = this.configService.get<string>(
      'DATABASE_PASSWORD',
      'postgres',
    );
    const database = this.configService.get<string>('DATABASE_NAME', 'postgres');
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    try {
      this.boss = new PgBoss({
        host,
        port,
        user,
        password,
        database,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        max: 5,
      });

      this.boss.on('error', (error) => {
        this.logger.warn(`pg-boss queue warning/error: ${error.message}`);
      });

      await this.boss.start();
      this.started = true;
      this.logger.log('pg-boss background job queue initialized and started.');
    } catch (error: any) {
      this.logger.warn(
        `Failed to connect pg-boss to Postgres: ${error.message}. Background worker operating in degraded/noop mode.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.boss && this.started) {
      try {
        await this.boss.stop({ graceful: true, timeout: 5000 });
        this.logger.log('pg-boss background queue stopped gracefully.');
      } catch (error: any) {
        this.logger.error(`Error stopping pg-boss: ${error.message}`);
      }
    }
  }

  isReady(): boolean {
    return this.started && this.boss !== null;
  }

  async sendJob<T extends object>(
    name: string,
    data: T,
    options?: EnqueueJobOptions,
  ): Promise<string | null> {
    if (!this.boss || !this.started) {
      this.logger.warn(
        `pg-boss not started. Skipping background job [${name}] delivery.`,
      );
      return null;
    }

    try {
      const jobId = await this.boss.send(name, data, options as any);
      return jobId;
    } catch (error: any) {
      this.logger.error(
        `Failed to enqueue job [${name}]: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async registerWorker<T extends object>(
    name: string,
    handler: (job: { id: string; name: string; data: T }) => Promise<void>,
  ): Promise<void> {
    if (!this.boss || !this.started) {
      this.logger.warn(
        `pg-boss not active. Worker registration for [${name}] deferred/skipped.`,
      );
      return;
    }

    try {
      await this.boss.work(name, async (jobs: any) => {
        const jobList = Array.isArray(jobs) ? jobs : [jobs];
        for (const job of jobList) {
          try {
            await handler({
              id: job.id,
              name: job.name,
              data: job.data,
            });
          } catch (err: any) {
            this.logger.error(
              `Error processing job [${job.id}] in queue [${name}]: ${err.message}`,
              err.stack,
            );
            throw err;
          }
        }
      });
      this.logger.log(`Worker registered successfully for queue [${name}].`);
    } catch (error: any) {
      this.logger.error(
        `Failed to register worker for [${name}]: ${error.message}`,
        error.stack,
      );
    }
  }
}
