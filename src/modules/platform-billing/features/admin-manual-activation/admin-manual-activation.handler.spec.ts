import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminManualActivationHandler } from './admin-manual-activation.handler';
import { AdminManualActivationCommand } from './admin-manual-activation.command';
import { DuplicateUtrException, PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';
import { BillingCycleEnum, PlanSlugEnum } from '../../domain/enums/platform-billing.enums';

describe('AdminManualActivationHandler', () => {
  let handler: AdminManualActivationHandler;
  let mockPaymentRepo: any;
  let mockSubscriptionRepo: any;
  let mockPlanRepo: any;
  let mockEventsGateway: any;

  beforeEach(() => {
    mockPaymentRepo = {
      findByPaymentId: vi.fn(),
      create: vi.fn((data) => ({ id: 'payment-123', ...data })),
      save: vi.fn((data) => Promise.resolve(data)),
      createInvoice: vi.fn((data) => Promise.resolve({ invoiceNumber: 'PATHIQ-INV-2026-0001', ...data })),
    };

    mockSubscriptionRepo = {
      findWithLock: vi.fn(),
      create: vi.fn((data) => ({ id: 'sub-123', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'sub-123', ...data })),
    };

    mockPlanRepo = {
      findBySlug: vi.fn(),
    };

    mockEventsGateway = {
      publishToClients: vi.fn(),
    };

    handler = new AdminManualActivationHandler(
      mockPaymentRepo,
      mockSubscriptionRepo,
      mockPlanRepo,
      mockEventsGateway,
    );
  });

  it('should throw DuplicateUtrException if UTR was already recorded', async () => {
    mockPaymentRepo.findByPaymentId.mockResolvedValueOnce({ id: 'existing-payment' });

    const command = new AdminManualActivationCommand(
      {
        labId: 'lab-1',
        planSlug: PlanSlugEnum.GROWTH,
        billingCycle: BillingCycleEnum.MONTHLY,
        utrNumber: '428190348122',
      },
      'admin@pathiq.in',
    );

    await expect(handler.execute(command)).rejects.toThrow(DuplicateUtrException);
    expect(mockPaymentRepo.findByPaymentId).toHaveBeenCalledWith('428190348122');
  });

  it('should throw PlanNotFoundException if plan slug does not exist', async () => {
    mockPaymentRepo.findByPaymentId.mockResolvedValueOnce(null);
    mockPlanRepo.findBySlug.mockResolvedValueOnce(null);

    const command = new AdminManualActivationCommand(
      {
        labId: 'lab-1',
        planSlug: PlanSlugEnum.GROWTH,
        billingCycle: BillingCycleEnum.MONTHLY,
        utrNumber: '428190348122',
      },
      'admin@pathiq.in',
    );

    await expect(handler.execute(command)).rejects.toThrow(PlanNotFoundException);
  });

  it('should activate subscription, create payment, invoice, and publish realtime event', async () => {
    mockPaymentRepo.findByPaymentId.mockResolvedValueOnce(null);
    mockPlanRepo.findBySlug.mockResolvedValueOnce({
      id: 'plan-growth',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
      monthlyPriceInr: 999,
      yearlyPriceInr: 9990,
    });
    mockSubscriptionRepo.findWithLock.mockResolvedValueOnce(null);

    const command = new AdminManualActivationCommand(
      {
        labId: 'lab-1',
        planSlug: PlanSlugEnum.GROWTH,
        billingCycle: BillingCycleEnum.MONTHLY,
        utrNumber: '428190348122',
        notes: 'Paid via PhonePe QR',
      },
      'admin@pathiq.in',
    );

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.planName).toBe('Growth Plan');
    expect(mockPaymentRepo.save).toHaveBeenCalled();
    expect(mockSubscriptionRepo.save).toHaveBeenCalled();
    expect(mockPaymentRepo.createInvoice).toHaveBeenCalled();
    expect(mockEventsGateway.publishToClients).toHaveBeenCalled();
  });
});
