import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CancelScheduledDowngradeCommand } from './cancel-scheduled-downgrade.command';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import { EventsGateway } from 'src/modules/websockets/infrastructure/gateways/events.gateway';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';

@Injectable()
export class CancelScheduledDowngradeHandler {
  private readonly logger = new Logger(CancelScheduledDowngradeHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async execute(command: CancelScheduledDowngradeCommand): Promise<{
    success: boolean;
    message: string;
  }> {
    const { labId } = command;

    const subscription = await this.subRepo.findWithLock(labId);
    if (!subscription) {
      throw new BadRequestException('No subscription found for this laboratory');
    }

    if (!subscription.scheduledPlanId) {
      throw new BadRequestException('No scheduled downgrade pending for this laboratory');
    }

    subscription.scheduledPlanId = null;
    subscription.scheduledBillingCycle = null;
    subscription.scheduledAt = null;

    await this.subRepo.save(subscription);

    try {
      const realtimeMessage: EventMessage = {
        channels: [RealtimeRoomBuilder.lab(labId)],
        event: RealtimeChannelEnum.SUBSCRIPTION_UPDATED,
        timestamp: new Date().toISOString(),
        traceId: randomUUID(),
        payload: {
          labId,
          status: subscription.status,
          scheduledPlanSlug: null,
          scheduledPlanName: null,
          scheduledBillingCycle: null,
          scheduledAt: null,
        },
      };
      this.eventsGateway.publishToClients(realtimeMessage);
    } catch (wsErr: any) {
      this.logger.warn(`Failed to broadcast cancel scheduled transition: ${wsErr.message}`);
    }

    this.logger.log(`Cancelled scheduled downgrade for lab ${labId}`);

    return {
      success: true,
      message: 'Scheduled downgrade cancelled. Your laboratory will renew on your current plan.',
    };
  }
}
