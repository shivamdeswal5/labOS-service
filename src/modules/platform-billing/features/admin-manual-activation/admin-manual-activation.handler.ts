import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
import { EventsGateway } from 'src/modules/websockets/infrastructure/gateways/events.gateway';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';
import { AdminManualActivationCommand } from './admin-manual-activation.command';
import {
  SubscriptionStatusEnum,
  BillingCycleEnum,
  PaymentProviderEnum,
  PaymentStatusEnum,
} from '../../domain/enums/platform-billing.enums';
import {
  DuplicateUtrException,
  PlanNotFoundException,
} from '../../domain/exceptions/platform-billing.exceptions';

export interface AdminManualActivationResult {
  success: boolean;
  paymentId: string;
  subscriptionId: string;
  invoiceNumber: string;
  planName: string;
  periodEnd: string;
}

@Injectable()
export class AdminManualActivationHandler {
  private readonly logger = new Logger(AdminManualActivationHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async execute(command: AdminManualActivationCommand): Promise<AdminManualActivationResult> {
    const { dto, adminEmail } = command;
    const cleanUtr = dto.utrNumber.trim();

    // 1. Anti-Fraud & Double-Spending Guard: Verify UTR uniqueness
    const existingPayment = await this.paymentRepo.findByPaymentId(cleanUtr);
    if (existingPayment) {
      this.logger.warn(
        `Manual activation rejected: UTR ${cleanUtr} was already credited to payment ${existingPayment.id}`,
      );
      throw new DuplicateUtrException(cleanUtr);
    }

    // 2. Fetch target platform plan
    const plan = await this.planRepo.findBySlug(dto.planSlug);
    if (!plan) {
      throw new PlanNotFoundException(dto.planSlug);
    }

    const amountInPaise =
      dto.billingCycle === BillingCycleEnum.YEARLY
        ? plan.yearlyPriceInr * 100
        : plan.monthlyPriceInr * 100;

    const now = new Date();
    const durationDays = dto.billingCycle === BillingCycleEnum.YEARLY ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 3. Atomically update or initialize tenant subscription
    let subscription = await this.subscriptionRepo.findWithLock(dto.labId);
    if (!subscription) {
      subscription = this.subscriptionRepo.create({
        labId: dto.labId,
        planId: plan.id,
        status: SubscriptionStatusEnum.ACTIVE,
        billingCycle: dto.billingCycle,
        trialStart: now,
        trialEnd: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        gracePeriodEnd: null,
      });
    } else {
      subscription.planId = plan.id;
      subscription.status = SubscriptionStatusEnum.ACTIVE;
      subscription.billingCycle = dto.billingCycle;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.gracePeriodEnd = null;
    }
    subscription = await this.subscriptionRepo.save(subscription);

    // 4. Create immutable platform payment record with UTR
    const payment = this.paymentRepo.create({
      labId: dto.labId,
      subscriptionId: subscription.id,
      provider: PaymentProviderEnum.MANUAL,
      providerPaymentId: cleanUtr,
      providerOrderId: `manual_${Date.now()}`,
      amountInPaise,
      currency: 'INR',
      status: PaymentStatusEnum.SUCCESS,
      paymentMethod: 'MANUAL_UTR',
      paymentDetails: {
        utr: cleanUtr,
        approvedBy: adminEmail,
        approvedAt: now.toISOString(),
        notes: dto.notes || 'Verified offline via Super Admin',
      },
    });
    const savedPayment = await this.paymentRepo.save(payment);

    // 5. Generate official GST Tax Invoice
    const subtotal = amountInPaise / 100;
    const invoiceNumber = `PATHIQ-INV-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
    const invoice = await this.paymentRepo.createInvoice({
      invoiceNumber,
      labId: dto.labId,
      paymentId: savedPayment.id,
      amountInr: subtotal,
      subtotalInr: subtotal,
      taxAmountInr: 0,
      billingPeriodStart: now,
      billingPeriodEnd: periodEnd,
      status: 'PAID',
    });

    // 6. Broadcast Realtime WebSocket event to unlock lab owner's screen instantly
    try {
      const realtimeMessage: EventMessage = {
        channels: [RealtimeRoomBuilder.lab(dto.labId)],
        event: RealtimeChannelEnum.SUBSCRIPTION_ACTIVATED,
        timestamp: new Date().toISOString(),
        traceId: randomUUID(),
        payload: {
          labId: dto.labId,
          planSlug: plan.slug,
          planName: plan.name,
          currentPeriodEnd: periodEnd.toISOString(),
          status: SubscriptionStatusEnum.ACTIVE,
        },
      };
      this.eventsGateway.publishToClients(realtimeMessage);
    } catch (wsErr: any) {
      this.logger.warn(`Failed to broadcast realtime activation: ${wsErr.message}`);
    }

    this.logger.log(
      `[Offline UTR Activated] Lab: ${dto.labId} | Plan: ${plan.slug} | UTR: ${cleanUtr} | ApprovedBy: ${adminEmail}`,
    );

    return {
      success: true,
      paymentId: savedPayment.id,
      subscriptionId: subscription.id,
      invoiceNumber: invoice.invoiceNumber,
      planName: plan.name,
      periodEnd: periodEnd.toISOString(),
    };
  }
}
