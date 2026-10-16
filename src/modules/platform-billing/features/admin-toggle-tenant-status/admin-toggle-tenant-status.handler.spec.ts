import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminToggleTenantStatusHandler } from './admin-toggle-tenant-status.handler';
import { AdminToggleTenantStatusCommand } from './admin-toggle-tenant-status.command';
import { SubscriptionNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';
import { SubscriptionStatusEnum } from '../../domain/enums/platform-billing.enums';

describe('AdminToggleTenantStatusHandler', () => {
  let handler: AdminToggleTenantStatusHandler;
  let mockSubscriptionRepo: any;
  let mockPlanRepo: any;
  let mockEventsGateway: any;

  beforeEach(() => {
    mockSubscriptionRepo = {
      findByLabId: vi.fn(),
      save: vi.fn((data) => Promise.resolve(data)),
      create: vi.fn((data) => data),
    };

    mockPlanRepo = {
      findBySlug: vi.fn().mockResolvedValue(null),
    };

    mockEventsGateway = {
      publishToClients: vi.fn(),
    };

    handler = new AdminToggleTenantStatusHandler(
      mockSubscriptionRepo,
      mockPlanRepo,
      mockEventsGateway,
    );
  });

  it('should throw SubscriptionNotFoundException when subscription is absent', async () => {
    mockSubscriptionRepo.findByLabId.mockResolvedValueOnce(null);

    const command = new AdminToggleTenantStatusCommand(
      'lab-unknown',
      { status: 'SUSPENDED', reason: 'Audit investigation' },
      'admin@pathiq.in',
    );

    await expect(handler.execute(command)).rejects.toThrow(SubscriptionNotFoundException);
  });

  it('should suspend tenant and broadcast lock event', async () => {
    const mockSub = {
      id: 'sub-1',
      labId: 'lab-1',
      status: SubscriptionStatusEnum.ACTIVE,
    };
    mockSubscriptionRepo.findByLabId.mockResolvedValueOnce(mockSub);

    const command = new AdminToggleTenantStatusCommand(
      'lab-1',
      { status: 'SUSPENDED', reason: 'Non-compliance hold' },
      'admin@pathiq.in',
    );

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.previousStatus).toBe(SubscriptionStatusEnum.ACTIVE);
    expect(result.newStatus).toBe(SubscriptionStatusEnum.SUSPENDED);
    expect(mockSub.status).toBe(SubscriptionStatusEnum.SUSPENDED);
    expect(mockSubscriptionRepo.save).toHaveBeenCalled();
    expect(mockEventsGateway.publishToClients).toHaveBeenCalled();
  });

  it('should resume tenant back to ACTIVE', async () => {
    const mockSub = {
      id: 'sub-1',
      labId: 'lab-1',
      status: SubscriptionStatusEnum.SUSPENDED,
    };
    mockSubscriptionRepo.findByLabId.mockResolvedValueOnce(mockSub);

    const command = new AdminToggleTenantStatusCommand(
      'lab-1',
      { status: 'ACTIVE', reason: 'Compliance issue cleared' },
      'admin@pathiq.in',
    );

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.newStatus).toBe(SubscriptionStatusEnum.ACTIVE);
    expect(mockSub.status).toBe(SubscriptionStatusEnum.ACTIVE);
  });
});
