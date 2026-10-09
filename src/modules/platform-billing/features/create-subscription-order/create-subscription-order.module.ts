import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay.adapter';
import { CreateSubscriptionOrderController } from './create-subscription-order.controller';
import { CreateSubscriptionOrderHandler } from './create-subscription-order.handler';

@Module({
  imports: [PlatformBillingDatabaseModule, ConfigModule],
  controllers: [CreateSubscriptionOrderController],
  providers: [CreateSubscriptionOrderHandler, RazorpayGatewayAdapter],
  exports: [CreateSubscriptionOrderHandler],
})
export class CreateSubscriptionOrderModule {}
