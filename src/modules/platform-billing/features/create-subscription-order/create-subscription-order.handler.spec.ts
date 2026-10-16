import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateSubscriptionOrderHandler } from './create-subscription-order.handler';
import { CreateSubscriptionOrderCommand } from './create-subscription-order.command';
import {
  BillingCycleEnum,
  PaymentProviderEnum,
  PaymentStatusEnum,
  PlanSlugEnum,
} from '../../domain/enums/platform-billing.enums';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';

describe('CreateSubscriptionOrderHandler', () => {
  let handler: CreateSubscriptionOrderHandler;
  let mockPlanRepo: any;
  let mockPaymentRepo: any;
  let mockSubRepo: any;
  let mockRazorpayAdapter: any;
  let mockWebhookHandler: any;

  beforeEach(() => {
    mockPlanRepo = {
      findBySlug: vi.fn(),
      findById: vi.fn(),
    };

    mockPaymentRepo = {
      findRecentPending: vi.fn(),
      create: vi.fn((data) => ({ id: 'pay-1', ...data })),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    mockSubRepo = {
      findByLabId: vi.fn(),
    };

    mockRazorpayAdapter = {
      keyId: 'rzp_test_key_123',
      createOrder: vi.fn(),
      fetchPaymentStatus: vi.fn(),
    };

    mockWebhookHandler = {
      activateSubscriptionFromPayment: vi.fn(),
    };

    handler = new CreateSubscriptionOrderHandler(
      mockPlanRepo,
      mockPaymentRepo,
      mockSubRepo,
      mockRazorpayAdapter,
      mockWebhookHandler,
    );
  });

  it('should reuse existing pending order created within 15 minutes when still pending in gateway', async () => {
    mockPlanRepo.findBySlug.mockResolvedValueOnce({
      id: 'plan-growth',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
      monthlyPriceInr: 999,
      yearlyPriceInr: 9990,
    });

    mockPaymentRepo.findRecentPending.mockResolvedValueOnce({
      id: 'pay-existing',
      providerOrderId: 'order_existing_123',
      amountInPaise: 99900,
      currency: 'INR',
    });

    mockRazorpayAdapter.fetchPaymentStatus.mockResolvedValueOnce({
      status: PaymentStatusEnum.PENDING,
    });

    const command = new CreateSubscriptionOrderCommand('lab-1', {
      planSlug: PlanSlugEnum.GROWTH,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(command);

    expect(result.orderId).toBe('order_existing_123');
    expect(result.amountInPaise).toBe(99900);
    expect(result.alreadyFulfilled).toBe(false);
    expect(mockRazorpayAdapter.createOrder).not.toHaveBeenCalled();
    expect(mockWebhookHandler.activateSubscriptionFromPayment).not.toHaveBeenCalled();
  });

  it('should self-heal and fulfill immediately if existing pending order was already paid at gateway (JIT verification)', async () => {
    mockPlanRepo.findBySlug.mockResolvedValueOnce({
      id: 'plan-growth',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
      monthlyPriceInr: 999,
      yearlyPriceInr: 9990,
    });

    mockPaymentRepo.findRecentPending.mockResolvedValueOnce({
      id: 'pay-existing-captured',
      providerOrderId: 'order_captured_123',
      amountInPaise: 99900,
      currency: 'INR',
    });

    mockRazorpayAdapter.fetchPaymentStatus.mockResolvedValueOnce({
      status: PaymentStatusEnum.SUCCESS,
      providerPaymentId: 'pay_captured_789',
      amountInPaise: 99900,
      paymentMethod: 'upi',
    });

    const command = new CreateSubscriptionOrderCommand('lab-1', {
      planSlug: PlanSlugEnum.GROWTH,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(command);

    expect(result.alreadyFulfilled).toBe(true);
    expect(result.orderId).toBe('order_captured_123');
    expect(mockWebhookHandler.activateSubscriptionFromPayment).toHaveBeenCalledWith({
      providerOrderId: 'order_captured_123',
      providerPaymentId: 'pay_captured_789',
      amountInPaise: 99900,
      paymentMethod: 'upi',
    });
    expect(mockRazorpayAdapter.createOrder).not.toHaveBeenCalled();
  });

  it('should expire failed previous order and create a fresh order for the user', async () => {
    mockPlanRepo.findBySlug.mockResolvedValue({
      id: 'plan-growth',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
      monthlyPriceInr: 999,
      yearlyPriceInr: 9990,
    });

    const failedPayment = {
      id: 'pay-failed',
      providerOrderId: 'order_failed_123',
      amountInPaise: 99900,
      status: PaymentStatusEnum.PENDING,
    };
    // First lookup finds failed payment; second lookup inside creationPromise finds null
    mockPaymentRepo.findRecentPending.mockResolvedValueOnce(failedPayment).mockResolvedValueOnce(null);

    mockRazorpayAdapter.fetchPaymentStatus.mockResolvedValueOnce({
      status: PaymentStatusEnum.FAILED,
    });

    mockRazorpayAdapter.createOrder.mockResolvedValueOnce({
      providerOrderId: 'order_fresh_456',
      keyId: 'rzp_test_key_123',
      amountInPaise: 99900,
      currency: 'INR',
    });

    const command = new CreateSubscriptionOrderCommand('lab-1', {
      planSlug: PlanSlugEnum.GROWTH,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(command);

    expect(failedPayment.status).toBe(PaymentStatusEnum.EXPIRED);
    expect(mockPaymentRepo.save).toHaveBeenCalledWith(failedPayment);
    expect(result.orderId).toBe('order_fresh_456');
    expect(mockRazorpayAdapter.createOrder).toHaveBeenCalledTimes(1);
  });

  it('should create a new Razorpay order and save pending payment if none exists', async () => {
    mockPlanRepo.findBySlug.mockResolvedValueOnce({
      id: 'plan-growth',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
      monthlyPriceInr: 999,
      yearlyPriceInr: 9990,
    });

    mockPaymentRepo.findRecentPending.mockResolvedValue(null);

    mockRazorpayAdapter.createOrder.mockResolvedValueOnce({
      providerOrderId: 'order_rzp_new_456',
      keyId: 'rzp_test_key_123',
      amountInPaise: 99900,
      currency: 'INR',
    });

    const command = new CreateSubscriptionOrderCommand('lab-1', {
      planSlug: PlanSlugEnum.GROWTH,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(command);

    expect(result.orderId).toBe('order_rzp_new_456');
    expect(mockRazorpayAdapter.createOrder).toHaveBeenCalledTimes(1);
    expect(mockPaymentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        labId: 'lab-1',
        provider: PaymentProviderEnum.RAZORPAY,
        providerOrderId: 'order_rzp_new_456',
        amountInPaise: 99900,
        status: PaymentStatusEnum.PENDING,
      }),
    );
    expect(mockPaymentRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should coalesce concurrent checkout creations for the same lab and plan into a single Razorpay order', async () => {
    mockPlanRepo.findBySlug.mockResolvedValue({
      id: 'plan-growth',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
      monthlyPriceInr: 999,
      yearlyPriceInr: 9990,
    });

    // Both initial lookups find null
    mockPaymentRepo.findRecentPending.mockResolvedValue(null);

    // Razorpay createOrder has simulated network latency
    mockRazorpayAdapter.createOrder.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return {
        providerOrderId: 'order_rzp_coalesced_789',
        keyId: 'rzp_test_key_123',
        amountInPaise: 99900,
        currency: 'INR',
      };
    });

    const command1 = new CreateSubscriptionOrderCommand('lab-1', {
      planSlug: PlanSlugEnum.GROWTH,
      billingCycle: BillingCycleEnum.MONTHLY,
    });
    const command2 = new CreateSubscriptionOrderCommand('lab-1', {
      planSlug: PlanSlugEnum.GROWTH,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    // Launch both concurrently (e.g. double click or two tabs)
    const [res1, res2] = await Promise.all([
      handler.execute(command1),
      handler.execute(command2),
    ]);

    expect(res1.orderId).toBe('order_rzp_coalesced_789');
    expect(res2.orderId).toBe('order_rzp_coalesced_789');
    // Crucially: Razorpay was called exactly ONCE, not twice!
    expect(mockRazorpayAdapter.createOrder).toHaveBeenCalledTimes(1);
  });

  it('should throw PlanNotFoundException when invalid plan slug is requested', async () => {
    mockPlanRepo.findBySlug.mockResolvedValueOnce(null);

    const command = new CreateSubscriptionOrderCommand('lab-1', {
      planSlug: 'invalid-plan' as any,
    });

    await expect(handler.execute(command)).rejects.toThrow(PlanNotFoundException);
  });
});
