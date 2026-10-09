import { Controller, Post } from '@nestjs/common';
import { ReconcileStalePaymentsHandler } from './reconcile-stale-payments.handler';
import { ReconcileStalePaymentsCommand } from './reconcile-stale-payments.command';

@Controller('billing')
export class ReconcileStalePaymentsController {
  constructor(private readonly handler: ReconcileStalePaymentsHandler) {}

  @Post('reconcile')
  async triggerReconciliation() {
    return this.handler.execute(new ReconcileStalePaymentsCommand());
  }
}
