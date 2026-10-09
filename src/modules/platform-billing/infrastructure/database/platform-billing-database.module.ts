import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformPlan } from '../../domain/entities/platform-plan.entity';
import { TenantSubscription } from '../../domain/entities/tenant-subscription.entity';
import { PlatformPayment } from '../../domain/entities/platform-payment.entity';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { SubscriptionInvoice } from '../../domain/entities/subscription-invoice.entity';

import { PlanRepository } from './repositories/plan.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { WebhookEventRepository } from './repositories/webhook-event.repository';

import { PLAN_REPOSITORY_TOKEN } from '../../domain/plan/interfaces/plan-repository.interface';
import { SUBSCRIPTION_REPOSITORY_TOKEN } from '../../domain/subscription/interfaces/subscription-repository.interface';
import { PAYMENT_REPOSITORY_TOKEN } from '../../domain/payment/interfaces/payment-repository.interface';
import { WEBHOOK_EVENT_REPOSITORY_TOKEN } from '../../domain/webhook/interfaces/webhook-event-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlatformPlan,
      TenantSubscription,
      PlatformPayment,
      WebhookEvent,
      SubscriptionInvoice,
    ]),
  ],
  providers: [
    {
      provide: PLAN_REPOSITORY_TOKEN,
      useClass: PlanRepository,
    },
    {
      provide: SUBSCRIPTION_REPOSITORY_TOKEN,
      useClass: SubscriptionRepository,
    },
    {
      provide: PAYMENT_REPOSITORY_TOKEN,
      useClass: PaymentRepository,
    },
    {
      provide: WEBHOOK_EVENT_REPOSITORY_TOKEN,
      useClass: WebhookEventRepository,
    },
  ],
  exports: [
    PLAN_REPOSITORY_TOKEN,
    SUBSCRIPTION_REPOSITORY_TOKEN,
    PAYMENT_REPOSITORY_TOKEN,
    WEBHOOK_EVENT_REPOSITORY_TOKEN,
  ],
})
export class PlatformBillingDatabaseModule {}
