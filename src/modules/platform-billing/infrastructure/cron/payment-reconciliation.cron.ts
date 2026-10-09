import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ReconcileStalePaymentsHandler } from '../../features/reconcile-stale-payments/reconcile-stale-payments.handler';

@Injectable()
export class PaymentReconciliationCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentReconciliationCron.name);
  private timer: NodeJS.Timeout | null = null;
  private readonly intervalMs = 30 * 60 * 1000; // 30 minutes

  constructor(private readonly reconcileHandler: ReconcileStalePaymentsHandler) {}

  onModuleInit(): void {
    this.logger.log('PaymentReconciliationCron initialized. Scheduling hourly safety-net reconciler.');
    // Run initial scan after 1 minute of boot
    setTimeout(() => {
      this.runReconciliation().catch((err) =>
        this.logger.warn(`Initial reconciliation scan warning: ${err.message}`),
      );
    }, 60 * 1000);

    // Schedule regular 30m interval
    this.timer = setInterval(() => {
      this.runReconciliation().catch((err) =>
        this.logger.error(`Periodic reconciliation scan error: ${err.message}`),
      );
    }, this.intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runReconciliation(): Promise<{ reconciledCount: number }> {
    this.logger.log('Starting payment reconciliation cycle...');
    const result = await this.reconcileHandler.execute();
    if (result.reconciledCount > 0) {
      this.logger.log(`Safety-Net Reconciliation: Self-healed ${result.reconciledCount} payments.`);
    } else {
      this.logger.log('Safety-Net Reconciliation: No stale payments requiring resolution.');
    }
    return result;
  }
}
