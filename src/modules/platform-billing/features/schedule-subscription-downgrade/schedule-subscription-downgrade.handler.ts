import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ScheduleSubscriptionDowngradeCommand } from './schedule-subscription-downgrade.command';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';
import {
  BillingCycleEnum,
  PlanSlugEnum,
  SubscriptionStatusEnum,
} from '../../domain/enums/platform-billing.enums';
import { EventsGateway } from 'src/modules/websockets/infrastructure/gateways/events.gateway';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';

@Injectable()
export class ScheduleSubscriptionDowngradeHandler {
  private readonly logger = new Logger(ScheduleSubscriptionDowngradeHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async execute(command: ScheduleSubscriptionDowngradeCommand): Promise<{
    success: boolean;
    scheduledPlanSlug: PlanSlugEnum;
    scheduledPlanName: string;
    scheduledBillingCycle: BillingCycleEnum;
    scheduledAt: string;
    message: string;
  }> {
    const { labId, dto } = command;

    const targetPlan = await this.planRepo.findBySlug(dto.planSlug);
    if (!targetPlan) {
      throw new PlanNotFoundException(dto.planSlug);
    }

    const subscription = await this.subRepo.findWithLock(labId);
    if (!subscription) {
      throw new BadRequestException('No subscription found for this laboratory');
    }

    if (subscription.status !== SubscriptionStatusEnum.ACTIVE) {
      throw new BadRequestException('Only active paid subscriptions can schedule a downgrade');
    }

    if (!subscription.currentPeriodEnd) {
      throw new BadRequestException('Active subscription is missing billing period end date');
    }

    const targetCycle =
      dto.billingCycle || subscription.billingCycle || BillingCycleEnum.MONTHLY;

    subscription.scheduledPlanId = targetPlan.id;
    subscription.scheduledBillingCycle = targetCycle;
    subscription.scheduledAt = subscription.currentPeriodEnd;

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
          scheduledPlanSlug: targetPlan.slug,
          scheduledPlanName: targetPlan.name,
          scheduledBillingCycle: targetCycle,
          scheduledAt: subscription.scheduledAt.toISOString(),
        },
      };
      this.eventsGateway.publishToClients(realtimeMessage);
    } catch (wsErr: any) {
      this.logger.warn(`Failed to broadcast realtime transition schedule: ${wsErr.message}`);
    }

    const dateFormatted = subscription.scheduledAt.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    this.logger.log(
      `Downgrade scheduled for lab ${labId} to ${targetPlan.slug} on ${subscription.scheduledAt.toISOString()}`,
    );

    return {
      success: true,
      scheduledPlanSlug: targetPlan.slug as PlanSlugEnum,
      scheduledPlanName: targetPlan.name,
      scheduledBillingCycle: targetCycle,
      scheduledAt: subscription.scheduledAt.toISOString(),
      message: `Your downgrade to ${targetPlan.name} is scheduled for ${dateFormatted}. You will retain all current capabilities until your billing period concludes.`,
    };
  }
}
