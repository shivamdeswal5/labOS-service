import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminUpdatePlanHandler } from './admin-update-plan.handler';
import { AdminUpdatePlanCommand } from './admin-update-plan.command';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';
import { PlanSlugEnum } from '../../domain/enums/platform-billing.enums';

describe('AdminUpdatePlanHandler', () => {
  let handler: AdminUpdatePlanHandler;
  let mockPlanRepo: any;

  beforeEach(() => {
    mockPlanRepo = {
      findById: vi.fn(),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    handler = new AdminUpdatePlanHandler(mockPlanRepo);
  });

  it('should throw PlanNotFoundException when plan is not found', async () => {
    mockPlanRepo.findById.mockResolvedValueOnce(null);

    const command = new AdminUpdatePlanCommand(
      'plan-unknown',
      { monthlyPriceInr: 2999 },
      'admin@pathiq.in',
    );

    await expect(handler.execute(command)).rejects.toThrow(PlanNotFoundException);
  });

  it('should update plan prices and save changes', async () => {
    const existingPlan = {
      id: 'plan-1',
      slug: PlanSlugEnum.GROWTH,
      name: 'Growth Plan',
      monthlyPriceInr: 1499,
      yearlyPriceInr: 14990,
      isActive: true,
      isPublic: true,
      featureEntitlements: { whatsappAlerts: true },
    };
    mockPlanRepo.findById.mockResolvedValueOnce(existingPlan);

    const command = new AdminUpdatePlanCommand(
      'plan-1',
      {
        monthlyPriceInr: 1799,
        yearlyPriceInr: 17990,
        name: 'Growth Pro',
      },
      'admin@pathiq.in',
    );

    const result = await handler.execute(command);

    expect(result.monthlyPriceInr).toBe(1799);
    expect(result.yearlyPriceInr).toBe(17990);
    expect(result.name).toBe('Growth Pro');
    expect(mockPlanRepo.save).toHaveBeenCalled();
  });
});
