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
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay.adapter';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';
import {
  BillingCycleEnum,
  PaymentProviderEnum,
  PaymentStatusEnum,
} from '../../domain/enums/platform-billing.enums';

@Injectable()
export class CreateSubscriptionOrderHandler {
  private readonly logger = new Logger(CreateSubscriptionOrderHandler.name);

  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
    private readonly razorpayAdapter: RazorpayGatewayAdapter,
  ) {}

  async execute(command: CreateSubscriptionOrderCommand): Promise<{
    orderId: string;
    keyId: string;
    amountInPaise: number;
    currency: string;
    planName: string;
  }> {
    const { labId, dto } = command;
    const billingCycle = dto.billingCycle ?? BillingCycleEnum.MONTHLY;

    const plan = await this.planRepo.findBySlug(dto.planSlug);
    if (!plan) {
      throw new PlanNotFoundException(dto.planSlug);
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

    if (existingPayment && existingPayment.providerOrderId) {
      this.logger.log(
        `Reusing existing active order ${existingPayment.providerOrderId} for lab ${labId}`,
      );
      return {
        orderId: existingPayment.providerOrderId,
        keyId: this.razorpayAdapter['keyId'],
        amountInPaise: existingPayment.amountInPaise,
        currency: existingPayment.currency,
        planName: plan.name,
      };
    }

    const receiptNumber = `PO-${Date.now().toString().slice(-6)}-${labId.slice(0, 4)}`;

    const orderResult = await this.razorpayAdapter.createOrder({
      tenantId: labId,
      planSlug: dto.planSlug,
      amountInPaise,
      currency: 'INR',
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
      idempotencyKey: `ord_${orderResult.providerOrderId}`,
      paymentDetails: {
        planSlug: dto.planSlug,
        billingCycle,
      },
    });

    await this.paymentRepo.save(payment);

    return {
      orderId: orderResult.providerOrderId,
      keyId: orderResult.keyId,
      amountInPaise: orderResult.amountInPaise,
      currency: orderResult.currency,
      planName: plan.name,
    };
  }
}
