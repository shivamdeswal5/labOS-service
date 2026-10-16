import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PreviewSubscriptionTransitionHandler } from './preview-subscription-transition.handler';
import { PreviewSubscriptionTransitionQuery } from './preview-subscription-transition.query';
import { PlanSlugEnum, BillingCycleEnum, SubscriptionStatusEnum } from '../../domain/enums/platform-billing.enums';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';

describe('PreviewSubscriptionTransitionHandler', () => {
  let handler: PreviewSubscriptionTransitionHandler;
  let mockSubRepo: any;
  let mockPlanRepo: any;

  const starterPlan = {
    id: 'plan-starter',
    slug: PlanSlugEnum.STARTER,
    name: 'Starter',
    monthlyPriceInr: 999,
    yearlyPriceInr: 9990,
  };

  const growthPlan = {
    id: 'plan-growth',
    slug: PlanSlugEnum.GROWTH,
    name: 'Growth',
    monthlyPriceInr: 1999,
    yearlyPriceInr: 19990,
  };

  beforeEach(() => {
    mockSubRepo = {
      findByLabId: vi.fn(),
    };
    mockPlanRepo = {
      findBySlug: vi.fn((slug: string) => {
        if (slug === PlanSlugEnum.STARTER) return Promise.resolve(starterPlan);
        if (slug === PlanSlugEnum.GROWTH) return Promise.resolve(growthPlan);
        return Promise.resolve(null);
      }),
    };

    handler = new PreviewSubscriptionTransitionHandler(mockSubRepo, mockPlanRepo);
  });

  it('should throw PlanNotFoundException when target plan does not exist', async () => {
    const query = new PreviewSubscriptionTransitionQuery('lab-1', {
      planSlug: 'invalid' as any,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    await expect(handler.execute(query)).rejects.toThrow(PlanNotFoundException);
  });

  it('should return NEW_ACTIVATION when lab is trialing or unactivated', async () => {
    mockSubRepo.findByLabId.mockResolvedValueOnce({
      id: 'sub-1',
      status: SubscriptionStatusEnum.TRIALING,
      plan: starterPlan,
    });

    const query = new PreviewSubscriptionTransitionQuery('lab-1', {
      planSlug: PlanSlugEnum.STARTER,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(query);

    expect(result.transitionType).toBe('NEW_ACTIVATION');
    expect(result.allowed).toBe(true);
    expect(result.grossAmountInPaise).toBe(99900);
    expect(result.taxGstInPaise).toBe(Math.round(99900 * 0.18));
    expect(result.netAmountInPaise).toBe(99900 + Math.round(99900 * 0.18));
  });

  it('should return SAME_PLAN (disallowed stacking) when buying same plan and cycle', async () => {
    const now = new Date();
    const future = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    mockSubRepo.findByLabId.mockResolvedValueOnce({
      id: 'sub-1',
      status: SubscriptionStatusEnum.ACTIVE,
      billingCycle: BillingCycleEnum.MONTHLY,
      currentPeriodStart: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: future,
      plan: starterPlan,
    });

    const query = new PreviewSubscriptionTransitionQuery('lab-1', {
      planSlug: PlanSlugEnum.STARTER,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(query);

    expect(result.transitionType).toBe('SAME_PLAN');
    expect(result.allowed).toBe(false);
    expect(result.grossAmountInPaise).toBe(0);
    expect(result.netAmountInPaise).toBe(0);
  });

  it('should return DOWNGRADE scheduled for period end when selecting a lower tier', async () => {
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

    mockSubRepo.findByLabId.mockResolvedValueOnce({
      id: 'sub-1',
      status: SubscriptionStatusEnum.ACTIVE,
      billingCycle: BillingCycleEnum.MONTHLY,
      currentPeriodStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: periodEnd,
      plan: growthPlan,
    });

    const query = new PreviewSubscriptionTransitionQuery('lab-1', {
      planSlug: PlanSlugEnum.STARTER,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(query);

    expect(result.transitionType).toBe('DOWNGRADE');
    expect(result.allowed).toBe(true);
    expect(result.isImmediate).toBe(false);
    expect(result.grossAmountInPaise).toBe(0);
    expect(result.netAmountInPaise).toBe(0);
    expect(result.effectiveDate).toBe(periodEnd.toISOString());
  });

  it('should return UPGRADE with proration credit applied when moving from Starter to Growth', async () => {
    const now = new Date();
    const periodStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    mockSubRepo.findByLabId.mockResolvedValueOnce({
      id: 'sub-1',
      status: SubscriptionStatusEnum.ACTIVE,
      billingCycle: BillingCycleEnum.MONTHLY,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      plan: starterPlan,
    });

    const query = new PreviewSubscriptionTransitionQuery('lab-1', {
      planSlug: PlanSlugEnum.GROWTH,
      billingCycle: BillingCycleEnum.MONTHLY,
    });

    const result = await handler.execute(query);

    expect(result.transitionType).toBe('UPGRADE');
    expect(result.allowed).toBe(true);
    expect(result.isImmediate).toBe(true);
    expect(result.prorationCreditInPaise).toBeGreaterThan(0);
    expect(result.grossAmountInPaise).toBe(199900 - result.prorationCreditInPaise);
    expect(result.taxGstInPaise).toBe(Math.round(result.grossAmountInPaise * 0.18));
    expect(result.netAmountInPaise).toBe(result.grossAmountInPaise + result.taxGstInPaise);
  });
});
