import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateSubscriptionOrderCommand } from './create-subscription-order.command';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/payment/interfaces/payment-repository.interface';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay.adapter';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';
import {
  BillingCycleEnum,
  PaymentProviderEnum,
  PaymentStatusEnum,
  CurrencyEnum,
} from '../../domain/enums/platform-billing.enums';

import { HandleRazorpayWebhookHandler } from '../handle-razorpay-webhook/handle-razorpay-webhook.handler';
import { PlatformPayment } from '../../domain/entities/platform-payment.entity';

export interface CreateSubscriptionOrderResult {
  orderId: string;
  keyId: string;
  amountInPaise: number;
  amount: number;
  currency: string;
  planName: string;
  alreadyFulfilled?: boolean;
}

@Injectable()
export class CreateSubscriptionOrderHandler {
  private readonly logger = new Logger(CreateSubscriptionOrderHandler.name);
  private readonly inFlightOrders = new Map<string, Promise<CreateSubscriptionOrderResult>>();

  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    private readonly razorpayAdapter: RazorpayGatewayAdapter,
    private readonly webhookHandler: HandleRazorpayWebhookHandler,
  ) {}

  async execute(command: CreateSubscriptionOrderCommand): Promise<CreateSubscriptionOrderResult> {
    const { labId, dto } = command;
    const billingCycle = dto.billingCycle ?? BillingCycleEnum.MONTHLY;

    const plan = dto.planSlug
      ? await this.planRepo.findBySlug(dto.planSlug)
      : dto.planId
        ? await this.planRepo.findById(dto.planId)
        : null;

    if (!plan) {
      throw new PlanNotFoundException(dto.planSlug || dto.planId || 'UNKNOWN');
    }

    const priceInr =
      billingCycle === BillingCycleEnum.YEARLY ? plan.yearlyPriceInr : plan.monthlyPriceInr;
    const amountInPaise = priceInr * 100;

    // Idempotency: Check for an active open pending payment created within the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const existingPayment = await this.paymentRepo.findRecentPending(
      labId,
      amountInPaise,
      fifteenMinutesAgo,
    );

    if (existingPayment) {
      const existingResult = await this.checkExistingPendingOrder(existingPayment, plan.name);
      if (existingResult) {
        return existingResult;
      }
    }

    // In-flight Promise coalescing: prevent concurrent double-clicks or multiple tabs
    // from initiating duplicate Razorpay orders simultaneously
    const coalesceKey = `${labId}:${plan.id}:${billingCycle}`;
    const inFlight = this.inFlightOrders.get(coalesceKey);
    if (inFlight) {
      this.logger.log(`Coalescing concurrent checkout creation for ${coalesceKey}`);
      return inFlight;
    }

    const creationPromise = (async () => {
      // Re-check after slot acquisition in case another request just committed
      const recentPayment = await this.paymentRepo.findRecentPending(
        labId,
        amountInPaise,
        fifteenMinutesAgo,
      );
      if (recentPayment) {
        const recentResult = await this.checkExistingPendingOrder(recentPayment, plan.name);
        if (recentResult) {
          return recentResult;
        }
      }

      const receiptNumber = `PO-${Date.now().toString().slice(-6)}-${labId.slice(0, 4)}`;

      const orderResult = await this.razorpayAdapter.createOrder({
        tenantId: labId,
        planSlug: plan.slug,
        amountInPaise,
        currency: CurrencyEnum.INR,
        receiptNumber,
        notes: {
          billingCycle,
        },
      });

      const payment = this.paymentRepo.create({
        labId,
        provider: PaymentProviderEnum.RAZORPAY,
        providerOrderId: orderResult.providerOrderId,
        amountInPaise: orderResult.amountInPaise,
        currency: orderResult.currency,
        status: PaymentStatusEnum.PENDING,
        fulfillmentStatus: null,
        idempotencyKey: `ord_${orderResult.providerOrderId}`,
        paymentDetails: {
          planSlug: plan.slug,
          billingCycle,
        },
      });

      await this.paymentRepo.save(payment);

      return {
        orderId: orderResult.providerOrderId,
        keyId: orderResult.keyId,
        amountInPaise: orderResult.amountInPaise,
        amount: orderResult.amountInPaise,
        currency: orderResult.currency,
        planName: plan.name,
      };
    })();

    this.inFlightOrders.set(coalesceKey, creationPromise);
    try {
      return await creationPromise;
    } finally {
      this.inFlightOrders.delete(coalesceKey);
    }
  }

  private async checkExistingPendingOrder(
    existingPayment: PlatformPayment,
    planName: string,
  ): Promise<CreateSubscriptionOrderResult | null> {
    if (!existingPayment.providerOrderId) {
      return null;
    }

    try {
      const gatewayStatus = await this.razorpayAdapter.fetchPaymentStatus(
        existingPayment.providerOrderId,
      );

      if (gatewayStatus && gatewayStatus.status === PaymentStatusEnum.SUCCESS) {
        this.logger.log(
          `JIT Verification: Order ${existingPayment.providerOrderId} was already captured at gateway. Fulfilling immediately.`,
        );
        await this.webhookHandler.activateSubscriptionFromPayment({
          providerOrderId: existingPayment.providerOrderId,
          providerPaymentId: gatewayStatus.providerPaymentId,
          amountInPaise: gatewayStatus.amountInPaise,
          paymentMethod: gatewayStatus.paymentMethod,
        });

        return {
          orderId: existingPayment.providerOrderId,
          keyId: this.razorpayAdapter['keyId'],
          amountInPaise: existingPayment.amountInPaise,
          amount: existingPayment.amountInPaise,
          currency: existingPayment.currency,
          planName,
          alreadyFulfilled: true,
        };
      }

      if (gatewayStatus && gatewayStatus.status === PaymentStatusEnum.FAILED) {
        this.logger.log(
          `JIT Verification: Previous order ${existingPayment.providerOrderId} failed at gateway. Expiring to allow fresh order creation.`,
        );
        existingPayment.status = PaymentStatusEnum.EXPIRED;
        await this.paymentRepo.save(existingPayment);
        return null;
      }

      // Still pending / open in gateway: safe to reuse for payment completion
      this.logger.log(
        `Reusing existing active pending order ${existingPayment.providerOrderId} for lab ${existingPayment.labId}`,
      );
      return {
        orderId: existingPayment.providerOrderId,
        keyId: this.razorpayAdapter['keyId'],
        amountInPaise: existingPayment.amountInPaise,
        amount: existingPayment.amountInPaise,
        currency: existingPayment.currency,
        planName,
        alreadyFulfilled: false,
      };
    } catch (err: any) {
      this.logger.warn(
        `JIT Verification error for ${existingPayment.providerOrderId}: ${err.message}. Defaulting to order reuse.`,
      );
      return {
        orderId: existingPayment.providerOrderId,
        keyId: this.razorpayAdapter['keyId'],
        amountInPaise: existingPayment.amountInPaise,
        amount: existingPayment.amountInPaise,
        currency: existingPayment.currency,
        planName,
        alreadyFulfilled: false,
      };
    }
  }
}
