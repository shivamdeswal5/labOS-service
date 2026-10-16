import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HandleRazorpayWebhookHandler } from './handle-razorpay-webhook.handler';
import { HandleRazorpayWebhookCommand } from './handle-razorpay-webhook.command';
import {
  BillingCycleEnum,
  PaymentFulfillmentStatusEnum,
  PaymentStatusEnum,
  PlanSlugEnum,
  SubscriptionStatusEnum,
} from '../../domain/enums/platform-billing.enums';
import { InvalidWebhookSignatureException } from '../../domain/exceptions/platform-billing.exceptions';
import { QUEUE_NAMES } from 'src/modules/shared/infrastructure/queue/pg-boss.service';

describe('HandleRazorpayWebhookHandler', () => {
  let handler: HandleRazorpayWebhookHandler;
  let mockDataSource: any;
  let mockRazorpayAdapter: any;
  let mockWebhookRepo: any;
  let mockPaymentRepo: any;
  let mockSubRepo: any;
  let mockPlanRepo: any;
  let mockEventEmitter: any;
  let mockEventsGateway: any;
  let mockQueueService: any;

  // Transaction manager repositories
  let txPaymentRepo: any;
  let txSubRepo: any;
  let txInvoiceRepo: any;
  let txPlanRepo: any;
  let txManager: any;

  beforeEach(() => {
    txPaymentRepo = {
      findOne: vi.fn(),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    txSubRepo = {
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'sub-new', ...data })),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    txInvoiceRepo = {
      create: vi.fn((data) => ({ id: 'inv-1', ...data })),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    txPlanRepo = {
      findOne: vi.fn(),
    };

    txManager = {
      getRepository: vi.fn((entity: any) => {
        if (entity.name === 'PlatformPayment') return txPaymentRepo;
        if (entity.name === 'TenantSubscription') return txSubRepo;
        if (entity.name === 'SubscriptionInvoice') return txInvoiceRepo;
        if (entity.name === 'PlatformPlan') return txPlanRepo;
        throw new Error(`Unexpected entity in test: ${entity.name}`);
      }),
      query: vi.fn().mockResolvedValue([{ seq: '100001' }]),
    };

    mockDataSource = {
      transaction: vi.fn(async (cb: (manager: any) => Promise<any>) => {
        return cb(txManager);
      }),
    };

    mockRazorpayAdapter = {
      verifyWebhookSignature: vi.fn().mockReturnValue(true),
      parseWebhook: vi.fn(),
    };

    mockWebhookRepo = {
      reserveEvent: vi.fn().mockResolvedValue('evt-db-1'),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      markFailed: vi.fn().mockResolvedValue(undefined),
    };

    mockPaymentRepo = {
      findByOrderId: vi.fn(),
      save: vi.fn(),
    };
    mockSubRepo = {};
    mockPlanRepo = {};

    mockEventEmitter = {
      emit: vi.fn(),
    };

    mockEventsGateway = {
      publishToClients: vi.fn(),
    };

    mockQueueService = {
      sendJob: vi.fn().mockResolvedValue('job-1'),
    };

    handler = new HandleRazorpayWebhookHandler(
      mockDataSource,
      mockRazorpayAdapter,
      mockWebhookRepo,
      mockPaymentRepo,
      mockSubRepo,
      mockPlanRepo,
      mockEventEmitter,
      mockEventsGateway,
      mockQueueService,
    );
  });

  it('should reject invalid webhook signature with InvalidWebhookSignatureException', async () => {
    mockRazorpayAdapter.verifyWebhookSignature.mockReturnValueOnce(false);

    const command = new HandleRazorpayWebhookCommand(
      'bad_sig',
      Buffer.from('payload'),
      {},
    );

    await expect(handler.execute(command)).rejects.toThrow(
      InvalidWebhookSignatureException,
    );
    expect(mockWebhookRepo.reserveEvent).not.toHaveBeenCalled();
  });

  it('should skip duplicate webhook event if already reserved', async () => {
    mockRazorpayAdapter.parseWebhook.mockReturnValueOnce({
      eventId: 'evt_dup_123',
      provider: 'RAZORPAY',
      eventType: 'PAYMENT_CAPTURED',
      rawPayload: {},
    });
    mockWebhookRepo.reserveEvent.mockResolvedValueOnce(null); // Already reserved!

    const command = new HandleRazorpayWebhookCommand(
      'valid_sig',
      Buffer.from('payload'),
      {},
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('IDEMPOTENT_SKIPPED');
    expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it('should atomically fulfill subscription and generate invoice from sequence for valid payment.captured', async () => {
    mockRazorpayAdapter.parseWebhook.mockReturnValueOnce({
      eventId: 'evt_1',
      provider: 'RAZORPAY',
      eventType: 'PAYMENT_CAPTURED',
      providerOrderId: 'order_rzp_1',
      providerPaymentId: 'pay_rzp_1',
      amountInPaise: 99900,
      paymentMethod: 'upi',
      paymentDetails: {},
      rawPayload: {},
    });

    const existingPayment = {
      id: 'pay-db-1',
      labId: 'lab-1',
      providerOrderId: 'order_rzp_1',
      amountInPaise: 99900,
      status: PaymentStatusEnum.PENDING,
      paymentDetails: { planSlug: PlanSlugEnum.GROWTH, billingCycle: BillingCycleEnum.MONTHLY },
    };
    txPaymentRepo.findOne.mockResolvedValueOnce(existingPayment);

    // Initial subscription does not exist
    txSubRepo.findOne.mockResolvedValueOnce(null);

    txPlanRepo.findOne.mockResolvedValueOnce({
      id: 'plan-1',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
    });

    const command = new HandleRazorpayWebhookCommand(
      'valid_sig',
      Buffer.from('payload'),
      {},
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('PROCESSED');
    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);

    // Verify payment updated to SUCCESS and FULFILLED
    expect(existingPayment.status).toBe(PaymentStatusEnum.SUCCESS);
    expect((existingPayment as any).fulfillmentStatus).toBe(PaymentFulfillmentStatusEnum.FULFILLED);
    expect(txPaymentRepo.save).toHaveBeenCalledWith(existingPayment);

    // Verify subscription created with 30 days
    expect(txSubRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        labId: 'lab-1',
        planId: 'plan-1',
        status: SubscriptionStatusEnum.ACTIVE,
      }),
    );
    expect(txSubRepo.save).toHaveBeenCalled();

    // Verify sequential invoice created
    expect(txInvoiceRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceNumber: expect.stringMatching(/^PATHIQ-INV-\d{4}-100001$/),
        labId: 'lab-1',
        amountInr: 999,
        status: 'PAID',
      }),
    );
    expect(txInvoiceRepo.save).toHaveBeenCalled();

    // Verify post-commit jobs
    expect(mockQueueService.sendJob).toHaveBeenCalledWith(
      QUEUE_NAMES.GENERATE_SUBSCRIPTION_INVOICE_PDF,
      expect.objectContaining({ invoiceId: 'inv-1', labId: 'lab-1' }),
    );
    expect(mockEventsGateway.publishToClients).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.activated', expect.any(Object));
    expect(mockWebhookRepo.markProcessed).toHaveBeenCalledWith('evt-db-1');
  });

  it('should idempotently skip redundant fulfillment when payment is already SUCCESS (e.g. payment.captured + order.paid)', async () => {
    mockRazorpayAdapter.parseWebhook.mockReturnValueOnce({
      eventId: 'evt_second_webhook',
      provider: 'RAZORPAY',
      eventType: 'ORDER_PAID',
      providerOrderId: 'order_rzp_1',
      providerPaymentId: 'pay_rzp_1',
      amountInPaise: 99900,
      paymentMethod: 'upi',
      rawPayload: {},
    });

    const alreadySuccessfulPayment = {
      id: 'pay-db-1',
      labId: 'lab-1',
      providerOrderId: 'order_rzp_1',
      status: PaymentStatusEnum.SUCCESS, // ALREADY SUCCESS!
      fulfillmentStatus: PaymentFulfillmentStatusEnum.FULFILLED,
    };
    txPaymentRepo.findOne.mockResolvedValueOnce(alreadySuccessfulPayment);

    const command = new HandleRazorpayWebhookCommand(
      'valid_sig',
      Buffer.from('payload'),
      {},
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('PROCESSED');
    // Payment was already SUCCESS, so inside transaction it returns early:
    expect(txPaymentRepo.save).not.toHaveBeenCalled();
    expect(txSubRepo.save).not.toHaveBeenCalled();
    expect(txInvoiceRepo.save).not.toHaveBeenCalled();
    expect(mockQueueService.sendJob).not.toHaveBeenCalled();
  });

  it('should safely recover a late capture when payment status is EXPIRED', async () => {
    mockRazorpayAdapter.parseWebhook.mockReturnValueOnce({
      eventId: 'evt_late_capture',
      provider: 'RAZORPAY',
      eventType: 'PAYMENT_CAPTURED',
      providerOrderId: 'order_rzp_expired',
      providerPaymentId: 'pay_rzp_late',
      amountInPaise: 99900,
      paymentMethod: 'upi',
      rawPayload: {},
    });

    const expiredPayment = {
      id: 'pay-db-expired',
      labId: 'lab-1',
      providerOrderId: 'order_rzp_expired',
      status: PaymentStatusEnum.EXPIRED, // Was marked expired by safety-net cron!
      amountInPaise: 99900,
      paymentDetails: { planSlug: PlanSlugEnum.GROWTH, billingCycle: BillingCycleEnum.MONTHLY },
    };
    txPaymentRepo.findOne.mockResolvedValueOnce(expiredPayment);
    txSubRepo.findOne.mockResolvedValueOnce(null);
    txPlanRepo.findOne.mockResolvedValueOnce({
      id: 'plan-1',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
    });

    const command = new HandleRazorpayWebhookCommand(
      'valid_sig',
      Buffer.from('payload'),
      {},
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('PROCESSED');
    // Recovered to SUCCESS and fulfilled!
    expect(expiredPayment.status).toBe(PaymentStatusEnum.SUCCESS);
    expect((expiredPayment as any).fulfillmentStatus).toBe(PaymentFulfillmentStatusEnum.FULFILLED);
    expect(txSubRepo.save).toHaveBeenCalled();
    expect(txInvoiceRepo.save).toHaveBeenCalled();
  });

  it('should apply Case B hold for accidental duplicate payment when subscription has > 7 days remaining', async () => {
    mockRazorpayAdapter.parseWebhook.mockReturnValueOnce({
      eventId: 'evt_accidental_dup',
      provider: 'RAZORPAY',
      eventType: 'PAYMENT_CAPTURED',
      providerOrderId: 'order_rzp_dup_order',
      providerPaymentId: 'pay_rzp_dup_pay',
      amountInPaise: 99900,
      paymentMethod: 'card',
      rawPayload: {},
    });

    const secondPayment = {
      id: 'pay-db-second',
      labId: 'lab-1',
      providerOrderId: 'order_rzp_dup_order',
      status: PaymentStatusEnum.PENDING,
      amountInPaise: 99900,
      paymentDetails: { planSlug: PlanSlugEnum.GROWTH, billingCycle: BillingCycleEnum.MONTHLY },
    };
    txPaymentRepo.findOne.mockResolvedValueOnce(secondPayment);

    // Active subscription with 25 days remaining
    const twentyFiveDaysLater = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
    const existingActiveSubscription = {
      id: 'sub-existing',
      labId: 'lab-1',
      planId: 'plan-1',
      status: SubscriptionStatusEnum.ACTIVE,
      currentPeriodEnd: twentyFiveDaysLater,
    };
    txSubRepo.findOne.mockResolvedValueOnce(existingActiveSubscription);

    txPlanRepo.findOne.mockResolvedValueOnce({
      id: 'plan-1',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
    });

    const command = new HandleRazorpayWebhookCommand(
      'valid_sig',
      Buffer.from('payload'),
      {},
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('PROCESSED');
    // Financial payment marked SUCCESS
    expect(secondPayment.status).toBe(PaymentStatusEnum.SUCCESS);
    // Fulfillment set to DUPLICATE_UNFULFILLED hold
    expect((secondPayment as any).fulfillmentStatus).toBe(
      PaymentFulfillmentStatusEnum.DUPLICATE_UNFULFILLED,
    );
    // Subscription period was NOT extended (subRepo.save was NOT called)
    expect(txSubRepo.save).not.toHaveBeenCalled();
    // Statutory GST Tax Invoice was still generated (every captured rupee gets an invoice)
    expect(txInvoiceRepo.save).toHaveBeenCalled();
  });

  it('should immediately fulfill a legitimate plan upgrade even when active subscription has > 7 days remaining', async () => {
    mockRazorpayAdapter.parseWebhook.mockReturnValueOnce({
      eventId: 'evt_upgrade_payment',
      provider: 'RAZORPAY',
      eventType: 'PAYMENT_CAPTURED',
      providerOrderId: 'order_rzp_upgrade',
      providerPaymentId: 'pay_rzp_upgrade_1',
      amountInPaise: 199900,
      paymentMethod: 'upi',
      rawPayload: {},
    });

    const upgradePayment = {
      id: 'pay-db-upgrade',
      labId: 'lab-1',
      providerOrderId: 'order_rzp_upgrade',
      status: PaymentStatusEnum.PENDING,
      amountInPaise: 199900,
      paymentDetails: { planSlug: PlanSlugEnum.GROWTH, billingCycle: BillingCycleEnum.MONTHLY },
    };
    txPaymentRepo.findOne.mockResolvedValueOnce(upgradePayment);

    // Active subscription on STARTER with 20 days remaining
    const twentyDaysLater = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    const existingStarterSubscription = {
      id: 'sub-starter',
      labId: 'lab-1',
      planId: 'plan-starter-id', // DIFFERENT PLAN ID!
      status: SubscriptionStatusEnum.ACTIVE,
      billingCycle: BillingCycleEnum.MONTHLY,
      currentPeriodEnd: twentyDaysLater,
    };
    txSubRepo.findOne.mockResolvedValueOnce(existingStarterSubscription);

    txPlanRepo.findOne.mockResolvedValueOnce({
      id: 'plan-growth-id',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
    });

    const command = new HandleRazorpayWebhookCommand(
      'valid_sig',
      Buffer.from('payload'),
      {},
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('PROCESSED');
    // Financial payment marked SUCCESS and FULFILLED (NOT held as duplicate!)
    expect(upgradePayment.status).toBe(PaymentStatusEnum.SUCCESS);
    expect((upgradePayment as any).fulfillmentStatus).toBe(PaymentFulfillmentStatusEnum.FULFILLED);
    // Subscription was upgraded to Growth plan and saved
    expect(existingStarterSubscription.planId).toBe('plan-growth-id');
    expect(txSubRepo.save).toHaveBeenCalledWith(existingStarterSubscription);
    expect(txInvoiceRepo.save).toHaveBeenCalled();
  });

  it('should skip fulfillment if payment was already marked DUPLICATE_UNFULFILLED', async () => {
    mockRazorpayAdapter.parseWebhook.mockReturnValueOnce({
      eventId: 'evt_dup_replay',
      provider: 'RAZORPAY',
      eventType: 'PAYMENT_CAPTURED',
      providerOrderId: 'order_rzp_dup',
      rawPayload: {},
    });

    const heldPayment = {
      id: 'pay-held',
      providerOrderId: 'order_rzp_dup',
      status: PaymentStatusEnum.SUCCESS,
      fulfillmentStatus: PaymentFulfillmentStatusEnum.DUPLICATE_UNFULFILLED,
    };
    txPaymentRepo.findOne.mockResolvedValueOnce(heldPayment);

    const command = new HandleRazorpayWebhookCommand(
      'valid_sig',
      Buffer.from('payload'),
      {},
    );

    const result = await handler.execute(command);

    expect(result.status).toBe('PROCESSED');
    expect(txPaymentRepo.save).not.toHaveBeenCalled();
    expect(txSubRepo.save).not.toHaveBeenCalled();
    expect(txInvoiceRepo.save).not.toHaveBeenCalled();
  });
});
