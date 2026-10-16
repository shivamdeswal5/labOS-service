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
  PaymentFulfillmentStatusEnum,
  PlanSlugEnum,
  SubscriptionStatusEnum,
} from '../../domain/enums/platform-billing.enums';
import { PlatformPayment } from '../../domain/entities/platform-payment.entity';
import { TenantSubscription } from '../../domain/entities/tenant-subscription.entity';
import { SubscriptionInvoice } from '../../domain/entities/subscription-invoice.entity';
import { PlatformPlan } from '../../domain/entities/platform-plan.entity';
import { EventsGateway } from 'src/modules/websockets/infrastructure/gateways/events.gateway';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';

import { PgBossService, QUEUE_NAMES } from 'src/modules/shared/infrastructure/queue/pg-boss.service';

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
    private readonly queueService: PgBossService,
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

    // Execute fulfillment atomically inside a database transaction
    const postCommitTask = await this.dataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(PlatformPayment);
      const subRepo = manager.getRepository(TenantSubscription);
      const invoiceRepo = manager.getRepository(SubscriptionInvoice);
      const planRepo = manager.getRepository(PlatformPlan);

      // 1. Fetch & lock payment row
      let payment: PlatformPayment | null = null;
      if (providerOrderId) {
        payment = await paymentRepo.findOne({
          where: { providerOrderId },
          lock: { mode: 'pessimistic_write' },
        });
      }
      if (!payment && providerPaymentId) {
        payment = await paymentRepo.findOne({
          where: { providerPaymentId },
          lock: { mode: 'pessimistic_write' },
        });
      }

      if (!payment) {
        this.logger.warn(
          `Payment not found for orderId: ${providerOrderId}, paymentId: ${providerPaymentId}`,
        );
        return;
      }

      // 2. Strict Idempotency Guard (Event Replays / Duplicate Webhooks e.g. payment.captured + order.paid)
      if (payment.status === PaymentStatusEnum.SUCCESS) {
        this.logger.log(`Payment ${payment.id} already marked SUCCESS. Skipping redundant fulfillment.`);
        return;
      }
      if (payment.fulfillmentStatus === PaymentFulfillmentStatusEnum.DUPLICATE_UNFULFILLED) {
        this.logger.log(`Payment ${payment.id} already processed as DUPLICATE_UNFULFILLED. Skipping.`);
        return;
      }

      // 3. Late Capture: If the payment was marked EXPIRED by the 15-minute reconciliation safety-net,
      // recover it to SUCCESS upon receiving valid capture from Razorpay.
      const isLateCapture = payment.status === PaymentStatusEnum.EXPIRED;
      if (isLateCapture) {
        this.logger.warn(
          `Late capture received for EXPIRED payment ${payment.id} (order: ${providerOrderId}). Recovering payment to SUCCESS.`,
        );
      }

      // 4. Update financial payment details
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

      // 5. Fetch & Lock Subscription
      let subscription = await subRepo.findOne({
        where: { labId: payment.labId },
        lock: { mode: 'pessimistic_write' },
      });

      const planSlug = (payment.paymentDetails?.planSlug as PlanSlugEnum) || PlanSlugEnum.GROWTH;
      const billingCycle =
        (payment.paymentDetails?.billingCycle as BillingCycleEnum) || BillingCycleEnum.MONTHLY;

      const plan = await planRepo.findOne({ where: { slug: planSlug } });
      if (!plan) {
        this.logger.error(`Plan not found for slug: ${planSlug}`);
        throw new Error(`Plan not found for slug: ${planSlug}`);
      }

      const durationDays = billingCycle === BillingCycleEnum.YEARLY ? 365 : 30;
      const now = new Date();

      const hasActiveUnexpired = Boolean(
        subscription &&
          subscription.status === SubscriptionStatusEnum.ACTIVE &&
          subscription.currentPeriodEnd &&
          subscription.currentPeriodEnd > now,
      );

      // Determine if this is an upgrade or billing cycle transition
      const isPlanChange = Boolean(subscription?.planId && subscription.planId !== plan.id);
      const isCycleChange = Boolean(
        subscription?.billingCycle && subscription.billingCycle !== billingCycle,
      );
      const isUpgradeOrTransition = isPlanChange || isCycleChange;

      // Accidental Duplicate Check (Case B):
      // Only applies if paying for the EXACT SAME plan and cycle while already active.
      // Upgrades and billing cycle transitions are ALWAYS fulfilled immediately!
      const isAccidentalDuplicate =
        !isUpgradeOrTransition &&
        hasActiveUnexpired &&
        subscription!.currentPeriodEnd! > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      let invoicePeriodStart: Date;
      let invoicePeriodEnd: Date;

      if (isAccidentalDuplicate) {
        this.logger.warn(
          `Accidental duplicate payment detected for lab ${payment.labId} (Payment ID: ${payment.id}). Setting DUPLICATE_UNFULFILLED hold; period not extended.`,
        );
        payment.fulfillmentStatus = PaymentFulfillmentStatusEnum.DUPLICATE_UNFULFILLED;
        payment.failureReason = 'Accidental duplicate payment; held for refund review';

        invoicePeriodStart = now;
        invoicePeriodEnd = subscription!.currentPeriodEnd!;
      } else {
        payment.fulfillmentStatus = PaymentFulfillmentStatusEnum.FULFILLED;

        // Upgrades start immediately from now; renewals extend from currentPeriodEnd
        const baseDate =
          !isUpgradeOrTransition && hasActiveUnexpired && subscription?.currentPeriodEnd
            ? subscription.currentPeriodEnd
            : now;
        const newEnd = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        if (!subscription) {
          subscription = subRepo.create({
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
          subscription.scheduledPlanId = null;
          subscription.scheduledBillingCycle = null;
          subscription.scheduledAt = null;
        }

        const savedSub = await subRepo.save(subscription);
        payment.subscriptionId = savedSub.id;

        invoicePeriodStart = baseDate;
        invoicePeriodEnd = newEnd;
      }

      await paymentRepo.save(payment);

      // 6. Generate Statutory GST Tax Invoice with Monotonic DB Sequence
      const seqResult = await manager.query("SELECT nextval('subscription_invoice_seq') as seq");
      const seqNum = seqResult[0]?.seq || seqResult[0]?.nextval || Date.now().toString().slice(-6);
      const invoiceNumber = `PATHIQ-INV-${now.getFullYear()}-${String(seqNum).padStart(6, '0')}`;

      const totalInr = (payment.amountInPaise || 0) / 100;
      const subtotalInr = Number((totalInr / 1.18).toFixed(2));
      const taxAmountInr = Number((totalInr - subtotalInr).toFixed(2));

      const invoice = invoiceRepo.create({
        invoiceNumber,
        labId: payment.labId,
        paymentId: payment.id,
        amountInr: totalInr,
        subtotalInr,
        taxAmountInr,
        customerGstin: subscription?.customerGstin || null,
        billingPeriodStart: invoicePeriodStart,
        billingPeriodEnd: invoicePeriodEnd,
        status: 'PAID',
      });

      const savedInvoice = await invoiceRepo.save(invoice);

      return {
        invoiceId: savedInvoice.id,
        invoiceNumber: savedInvoice.invoiceNumber,
        labId: payment.labId,
        planSlug: plan.slug,
        planName: plan.name,
        currentPeriodEnd: isAccidentalDuplicate ? (subscription?.currentPeriodEnd || now) : invoicePeriodEnd,
        totalInr,
      };
    });

    // 7. Post-Commit Actions: Runs strictly after atomic DB commit succeeds
    if (postCommitTask) {
      try {
        await this.queueService.sendJob(QUEUE_NAMES.GENERATE_SUBSCRIPTION_INVOICE_PDF, {
          invoiceId: postCommitTask.invoiceId,
          labId: postCommitTask.labId,
        });
        this.logger.log(`Enqueued invoice PDF generation job for ${postCommitTask.invoiceNumber}`);
      } catch (qErr: any) {
        this.logger.warn(`Failed to enqueue invoice PDF job: ${qErr.message}`);
      }

      // Publish Realtime WebSocket event to lab room
      try {
        const realtimeMessage: EventMessage = {
          channels: [RealtimeRoomBuilder.lab(postCommitTask.labId)],
          event: RealtimeChannelEnum.SUBSCRIPTION_ACTIVATED,
          timestamp: new Date().toISOString(),
          traceId: randomUUID(),
          payload: {
            labId: postCommitTask.labId,
            planSlug: postCommitTask.planSlug,
            planName: postCommitTask.planName,
            currentPeriodEnd: postCommitTask.currentPeriodEnd.toISOString(),
            status: SubscriptionStatusEnum.ACTIVE,
          },
        };
        this.eventsGateway.publishToClients(realtimeMessage);
      } catch (wsErr: any) {
        this.logger.warn(`Failed to broadcast websocket event: ${wsErr.message}`);
      }

      // Emit domain event for asynchronous receipts
      this.eventEmitter.emit('subscription.activated', {
        labId: postCommitTask.labId,
        planSlug: postCommitTask.planSlug,
        invoiceNumber: postCommitTask.invoiceNumber,
        amountInr: postCommitTask.totalInr,
      });
    }
  }
}
