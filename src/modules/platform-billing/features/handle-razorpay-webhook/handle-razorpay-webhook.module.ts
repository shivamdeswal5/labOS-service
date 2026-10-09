import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay.adapter';
import { EventsGatewayModule } from 'src/modules/websockets/infrastructure/gateways/events-gateway.module';
import { HandleRazorpayWebhookController } from './handle-razorpay-webhook.controller';
import { HandleRazorpayWebhookHandler } from './handle-razorpay-webhook.handler';

@Module({
  imports: [
    PlatformBillingDatabaseModule,
    ConfigModule,
    EventsGatewayModule,
  ],
  controllers: [HandleRazorpayWebhookController],
  providers: [HandleRazorpayWebhookHandler, RazorpayGatewayAdapter],
  exports: [HandleRazorpayWebhookHandler],
})
export class HandleRazorpayWebhookModule {}
