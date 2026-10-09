import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { HandleRazorpayWebhookCommand } from './handle-razorpay-webhook.command';
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay.adapter';
import {
  IWebhookEventRepository,
  WEBHOOK_EVENT_REPOSITORY_TOKEN,
} from '../../domain/webhook/interfaces/webhook-event-repository.interface';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/payment/interfaces/payment-repository.interface';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';
import { InvalidWebhookSignatureException } from '../../domain/exceptions/platform-billing.exceptions';
import {
  BillingCycleEnum,
  PaymentStatusEnum,
  PlanSlugEnum,
  SubscriptionStatusEnum,
} from '../../domain/enums/platform-billing.enums';
import { EventsGateway } from 'src/modules/websockets/infrastructure/gateways/events.gateway';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';

@Injectable()
export class HandleRazorpayWebhookHandler {
  private readonly logger = new Logger(HandleRazorpayWebhookHandler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly razorpayAdapter: RazorpayGatewayAdapter,
    @Inject(WEBHOOK_EVENT_REPOSITORY_TOKEN)
    private readonly webhookRepo: IWebhookEventRepository,
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async execute(command: HandleRazorpayWebhookCommand): Promise<{ received: boolean; status: string }> {
    const { rawBody, signature, payload } = command;

    const isValid = this.razorpayAdapter.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      this.logger.warn('Unauthorized webhook signature mismatch rejected');
      throw new InvalidWebhookSignatureException();
    }

    const normalized = this.razorpayAdapter.parseWebhook(payload);

    // Atomic insert reservation into webhook_events to eliminate race conditions
    const webhookEventId = await this.webhookRepo.reserveEvent(
      normalized.eventId,
      normalized.provider,
      normalized.eventType,
      normalized.rawPayload,
    );

    if (!webhookEventId) {
      this.logger.log(`Webhook event ${normalized.eventId} already recorded or processing. Idempotent skip.`);
      return { received: true, status: 'IDEMPOTENT_SKIPPED' };
    }

    try {
      if (normalized.eventType === 'PAYMENT_CAPTURED' || normalized.eventType === 'ORDER_PAID') {
        if (!normalized.providerOrderId && !normalized.providerPaymentId) {
          this.logger.warn(`Webhook ${normalized.eventId} missing order/payment ID`);
          return { received: true, status: 'SKIPPED_NO_IDENTIFIER' };
        }

        await this.activateSubscriptionFromPayment({
          providerOrderId: normalized.providerOrderId,
          providerPaymentId: normalized.providerPaymentId,
          amountInPaise: normalized.amountInPaise,
          paymentMethod: normalized.paymentMethod,
          paymentDetails: normalized.paymentDetails || {},
        });
      } else if (normalized.eventType === 'PAYMENT_FAILED') {
        if (normalized.providerOrderId) {
          const payment = await this.paymentRepo.findByOrderId(normalized.providerOrderId);
          if (payment) {
            payment.status = PaymentStatusEnum.FAILED;
            payment.failureReason = normalized.failureReason || 'Declined by bank';
            await this.paymentRepo.save(payment);
          }
        }
      }

      await this.webhookRepo.markProcessed(webhookEventId);
      return { received: true, status: 'PROCESSED' };
    } catch (err: any) {
      this.logger.error(`Error processing webhook ${normalized.eventId}: ${err.message}`, err.stack);
      await this.webhookRepo.markFailed(webhookEventId, err.message);
      throw err;
    }
  }

  async activateSubscriptionFromPayment(params: {
    providerOrderId?: string;
    providerPaymentId?: string;
    amountInPaise?: number;
    paymentMethod?: string;
    paymentDetails?: Record<string, any>;
  }): Promise<void> {
    const { providerOrderId, providerPaymentId, paymentMethod, paymentDetails } = params;

    let payment = providerOrderId
      ? await this.paymentRepo.findByOrderId(providerOrderId)
      : null;

    if (!payment && providerPaymentId) {
      payment = await this.paymentRepo.findByPaymentId(providerPaymentId);
    }

    if (!payment) {
      this.logger.warn(
        `Payment not found for orderId: ${providerOrderId}, paymentId: ${providerPaymentId}`,
      );
      return;
    }

    if (payment.status === PaymentStatusEnum.SUCCESS) {
      this.logger.log(`Payment ${payment.id} already marked SUCCESS. Skipping redundant update.`);
      return;
    }

    payment.status = PaymentStatusEnum.SUCCESS;
    if (providerPaymentId) {
      payment.providerPaymentId = providerPaymentId;
    }
    if (paymentMethod) {
      payment.paymentMethod = paymentMethod;
    }
    if (paymentDetails) {
      payment.paymentDetails = { ...payment.paymentDetails, ...paymentDetails };
    }
    await this.paymentRepo.save(payment);

    // Lock and fetch tenant subscription
    let subscription = await this.subRepo.findWithLock(payment.labId);

    const planSlug = (payment.paymentDetails?.planSlug as PlanSlugEnum) || PlanSlugEnum.GROWTH;
    const billingCycle =
      (payment.paymentDetails?.billingCycle as BillingCycleEnum) || BillingCycleEnum.MONTHLY;

    const plan = await this.planRepo.findBySlug(planSlug);
    if (!plan) {
      this.logger.error(`Plan not found for slug: ${planSlug}`);
      return;
    }

    const durationDays = billingCycle === BillingCycleEnum.YEARLY ? 365 : 30;
    const now = new Date();

    const hasActiveUnexpired = Boolean(
      subscription &&
      subscription.status === SubscriptionStatusEnum.ACTIVE &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd > now,
    );

    const baseDate =
      hasActiveUnexpired && subscription?.currentPeriodEnd
        ? subscription.currentPeriodEnd
        : now;
    const newEnd = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    if (!subscription) {
      subscription = this.subRepo.create({
        labId: payment.labId,
        planId: plan.id,
        status: SubscriptionStatusEnum.ACTIVE,
        billingCycle,
        trialStart: now,
        trialEnd: now,
        currentPeriodStart: baseDate,
        currentPeriodEnd: newEnd,
      });
    } else {
      subscription.planId = plan.id;
      subscription.status = SubscriptionStatusEnum.ACTIVE;
      subscription.billingCycle = billingCycle;
      subscription.currentPeriodStart = baseDate;
      subscription.currentPeriodEnd = newEnd;
      subscription.gracePeriodEnd = null;
    }

    const savedSub = await this.subRepo.save(subscription);

    payment.subscriptionId = savedSub.id;
    await this.paymentRepo.save(payment);

    // Generate Tax Invoice
    const invoiceNumber = `PATHIQ-INV-${now.getFullYear()}-${Date.now().toString().slice(-6)}`;
    const totalInr = (payment.amountInPaise || 0) / 100;
    const subtotalInr = Number((totalInr / 1.18).toFixed(2));
    const taxAmountInr = Number((totalInr - subtotalInr).toFixed(2));

    await this.paymentRepo.createInvoice({
      invoiceNumber,
      labId: payment.labId,
      paymentId: payment.id,
      amountInr: totalInr,
      subtotalInr,
      taxAmountInr,
      billingPeriodStart: baseDate,
      billingPeriodEnd: newEnd,
      status: 'PAID',
    });

    this.logger.log(
      `Subscription activated for lab ${payment.labId} on plan ${plan.slug} until ${newEnd.toISOString()}`,
    );

    // Publish Realtime WebSocket event to lab room
    try {
      const realtimeMessage: EventMessage = {
        channels: [RealtimeRoomBuilder.lab(payment.labId)],
        event: RealtimeChannelEnum.SUBSCRIPTION_ACTIVATED,
        timestamp: new Date().toISOString(),
        traceId: randomUUID(),
        payload: {
          labId: payment.labId,
          planSlug: plan.slug,
          planName: plan.name,
          currentPeriodEnd: newEnd.toISOString(),
          status: SubscriptionStatusEnum.ACTIVE,
        },
      };
      this.eventsGateway.publishToClients(realtimeMessage);
    } catch (wsErr: any) {
      this.logger.warn(`Failed to broadcast websocket event: ${wsErr.message}`);
    }

    // Emit domain event for asynchronous receipts
    this.eventEmitter.emit('subscription.activated', {
      labId: payment.labId,
      planSlug: plan.slug,
      invoiceNumber,
      amountInr: totalInr,
    });
  }
}
