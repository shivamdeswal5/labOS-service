import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay.adapter';
import { HandleRazorpayWebhookModule } from '../handle-razorpay-webhook/handle-razorpay-webhook.module';
import { ReconcileStalePaymentsController } from './reconcile-stale-payments.controller';
import { ReconcileStalePaymentsHandler } from './reconcile-stale-payments.handler';

@Module({
  imports: [
    PlatformBillingDatabaseModule,
    ConfigModule,
    HandleRazorpayWebhookModule,
  ],
  controllers: [ReconcileStalePaymentsController],
  providers: [ReconcileStalePaymentsHandler, RazorpayGatewayAdapter],
  exports: [ReconcileStalePaymentsHandler],
})
export class ReconcileStalePaymentsModule {}
