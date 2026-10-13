import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminExtendTrialHandler } from './admin-extend-trial.handler';
import { AdminExtendTrialCommand } from './admin-extend-trial.command';
import { SubscriptionNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';
import { SubscriptionStatusEnum } from '../../domain/enums/platform-billing.enums';

describe('AdminExtendTrialHandler', () => {
  let handler: AdminExtendTrialHandler;
  let mockSubscriptionRepo: any;
  let mockEventsGateway: any;

  beforeEach(() => {
    mockSubscriptionRepo = {
      findByLabId: vi.fn(),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    mockEventsGateway = {
      publishToClients: vi.fn(),
    };

    handler = new AdminExtendTrialHandler(
      mockSubscriptionRepo,
      mockEventsGateway,
    );
  });

  it('should throw SubscriptionNotFoundException when subscription is absent', async () => {
    mockSubscriptionRepo.findByLabId.mockResolvedValueOnce(null);

    const command = new AdminExtendTrialCommand(
      'lab-unknown',
      { days: 14, reason: 'Pilot extension' },
      'admin@pathiq.in',
    );

    await expect(handler.execute(command)).rejects.toThrow(SubscriptionNotFoundException);
  });

  it('should extend trial days and broadcast realtime update', async () => {
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const mockSub = {
      id: 'sub-1',
      labId: 'lab-1',
      trialEnd: futureDate,
      status: SubscriptionStatusEnum.TRIALING,
    };
    mockSubscriptionRepo.findByLabId.mockResolvedValueOnce(mockSub);

    const command = new AdminExtendTrialCommand(
      'lab-1',
      { days: 14, reason: 'Trial support requested' },
      'admin@pathiq.in',
    );

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.daysAdded).toBe(14);
    expect(mockSubscriptionRepo.save).toHaveBeenCalled();
    expect(mockEventsGateway.publishToClients).toHaveBeenCalled();
  });

  it('should transition LOCKED subscription back to TRIALING when extended', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const mockSub = {
      id: 'sub-2',
      labId: 'lab-2',
      trialEnd: pastDate,
      status: SubscriptionStatusEnum.LOCKED,
    };
    mockSubscriptionRepo.findByLabId.mockResolvedValueOnce(mockSub);

    const command = new AdminExtendTrialCommand(
      'lab-2',
      { days: 7 },
      'admin@pathiq.in',
    );

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.status).toBe(SubscriptionStatusEnum.TRIALING);
    expect(mockSub.status).toBe(SubscriptionStatusEnum.TRIALING);
  });
});
