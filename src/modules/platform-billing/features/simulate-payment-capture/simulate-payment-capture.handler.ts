import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SimulatePaymentCaptureCommand } from './simulate-payment-capture.command';
import { SimulatePaymentActionEnum } from './simulate-payment-capture.dto';
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

import { PgBossService, QUEUE_NAMES } from 'src/modules/shared/infrastructure/queue/pg-boss.service';

@Injectable()
export class SimulatePaymentCaptureHandler {
  private readonly logger = new Logger(SimulatePaymentCaptureHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    private readonly eventsGateway: EventsGateway,
    private readonly queueService: PgBossService,
  ) {}

  async execute(command: SimulatePaymentCaptureCommand): Promise<{
    success: boolean;
    status: PaymentStatusEnum;
    message: string;
    subscription?: any;
  }> {
    const { labId, dto } = command;

    const isSimulatedOrder =
      dto.orderId.startsWith('order_sim_') || dto.orderId.startsWith('manual_ord_');
    const isDevEnv = process.env.NODE_ENV !== 'production';

    if (!isDevEnv && !isSimulatedOrder) {
      throw new ForbiddenException('Simulation endpoint is only available for sandbox test orders');
    }

    const payment = await this.paymentRepo.findByOrderId(dto.orderId);
    if (!payment) {
      throw new NotFoundException(`Payment record not found for order ${dto.orderId}`);
    }

    if (payment.labId !== labId) {
      throw new BadRequestException('Order does not belong to your laboratory');
    }

    if (dto.action === SimulatePaymentActionEnum.DECLINE) {
      payment.status = PaymentStatusEnum.FAILED;
      payment.failureReason = 'Simulated bank card decline';
      await this.paymentRepo.save(payment);

      return {
        success: false,
        status: PaymentStatusEnum.FAILED,
        message: 'Payment declined by issuer bank (Simulated Failure)',
      };
    }

    if (dto.action === SimulatePaymentActionEnum.TIMEOUT) {
      return {
        success: false,
        status: PaymentStatusEnum.PENDING,
        message: 'Awaiting bank confirmation. This payment is currently processing in the background.',
      };
    }

    // Handle SUCCESS
    payment.status = PaymentStatusEnum.SUCCESS;
    payment.providerPaymentId = `pay_sim_${Date.now()}`;
    payment.paymentMethod = 'UPI_SIMULATED';
    await this.paymentRepo.save(payment);

    const planSlug =
      (payment.paymentDetails?.planSlug as PlanSlugEnum) || PlanSlugEnum.GROWTH;
    const billingCycle =
      (payment.paymentDetails?.billingCycle as BillingCycleEnum) || BillingCycleEnum.MONTHLY;

    const plan = await this.planRepo.findBySlug(planSlug);
    if (!plan) {
      throw new NotFoundException(`Target plan ${planSlug} not found`);
    }

    const durationDays = billingCycle === BillingCycleEnum.YEARLY ? 365 : 30;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    let subscription = await this.subRepo.findWithLock(labId);
    if (!subscription) {
      subscription = this.subRepo.create({
        labId,
        planId: plan.id,
        status: SubscriptionStatusEnum.ACTIVE,
        billingCycle,
        trialStart: now,
        trialEnd: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        gracePeriodEnd: null,
        scheduledPlanId: null,
        scheduledBillingCycle: null,
        scheduledAt: null,
      });
    } else {
      subscription.planId = plan.id;
      subscription.status = SubscriptionStatusEnum.ACTIVE;
      subscription.billingCycle = billingCycle;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.gracePeriodEnd = null;
      // Reset any pending downgrade when a new paid plan is activated
      subscription.scheduledPlanId = null;
      subscription.scheduledBillingCycle = null;
      subscription.scheduledAt = null;
    }

    await this.subRepo.save(subscription);

    // Generate Tax Invoice for simulated activation
    const invoiceNumber = `PATHIQ-INV-${now.getFullYear()}-${Date.now().toString().slice(-6)}`;
    const totalInr = (payment.amountInPaise || 0) / 100;
    const subtotalInr = Number((totalInr / 1.18).toFixed(2));
    const taxAmountInr = Number((totalInr - subtotalInr).toFixed(2));

    try {
      const invoice = await this.paymentRepo.createInvoice({
        invoiceNumber,
        labId,
        paymentId: payment.id,
        amountInr: totalInr,
        subtotalInr,
        taxAmountInr,
        customerGstin: subscription.customerGstin || null,
        billingPeriodStart: now,
        billingPeriodEnd: periodEnd,
        status: 'PAID',
      });

      await this.queueService.sendJob(QUEUE_NAMES.GENERATE_SUBSCRIPTION_INVOICE_PDF, {
        invoiceId: invoice.id,
        labId,
      });
      this.logger.log(`Generated simulated invoice [${invoiceNumber}] and enqueued PDF job`);
    } catch (invErr: any) {
      this.logger.warn(`Failed to create simulated invoice: ${invErr.message}`);
    }

    try {
      const realtimeMessage: EventMessage = {
        channels: [RealtimeRoomBuilder.lab(labId)],
        event: RealtimeChannelEnum.SUBSCRIPTION_ACTIVATED,
        timestamp: new Date().toISOString(),
        traceId: randomUUID(),
        payload: {
          labId,
          planSlug: plan.slug,
          planName: plan.name,
          currentPeriodEnd: periodEnd.toISOString(),
          status: SubscriptionStatusEnum.ACTIVE,
        },
      };
      this.eventsGateway.publishToClients(realtimeMessage);
    } catch (wsErr: any) {
      this.logger.warn(`Failed to broadcast simulated payment activation: ${wsErr.message}`);
    }

    this.logger.log(`Simulated payment success for lab ${labId} on plan ${plan.slug}`);

    return {
      success: true,
      status: PaymentStatusEnum.SUCCESS,
      message: `Payment authorized! Your ${plan.name} subscription is now active.`,
      subscription: {
        planSlug: plan.slug,
        planName: plan.name,
        currentPeriodEnd: periodEnd.toISOString(),
      },
    };
  }
}
