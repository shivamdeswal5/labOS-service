import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';
import { EventsGateway } from 'src/modules/websockets/infrastructure/gateways/events.gateway';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';
import { AdminExtendTrialCommand } from './admin-extend-trial.command';
import { SubscriptionStatusEnum, BillingCycleEnum, PlanSlugEnum } from '../../domain/enums/platform-billing.enums';
import { SubscriptionNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';

export interface AdminExtendTrialResult {
  success: boolean;
  labId: string;
  previousTrialEnd: string;
  newTrialEnd: string;
  daysAdded: number;
  status: SubscriptionStatusEnum;
}

@Injectable()
export class AdminExtendTrialHandler {
  private readonly logger = new Logger(AdminExtendTrialHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async execute(command: AdminExtendTrialCommand): Promise<AdminExtendTrialResult> {
    const { labId, dto, adminEmail } = command;
    let subscription = await this.subscriptionRepo.findByLabId(labId);

    if (!subscription) {
      // JIT auto-provisioning
      const defaultPlan = await this.planRepo.findBySlug(PlanSlugEnum.STARTER);
      if (defaultPlan) {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const newSub = this.subscriptionRepo.create({
          labId,
          planId: defaultPlan.id,
          status: SubscriptionStatusEnum.TRIALING,
          billingCycle: BillingCycleEnum.MONTHLY,
          trialStart: now,
          trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          gracePeriodEnd: null,
        });
        subscription = await this.subscriptionRepo.save(newSub);
        subscription.plan = defaultPlan;
      } else {
        throw new SubscriptionNotFoundException(labId);
      }
    }


    const now = new Date();
    const currentTrialEnd = subscription.trialEnd ? new Date(subscription.trialEnd) : now;
    const baseDate = currentTrialEnd.getTime() > now.getTime() ? currentTrialEnd : now;
    const newTrialEnd = new Date(baseDate.getTime() + dto.days * 24 * 60 * 60 * 1000);

    const previousTrialEnd = currentTrialEnd.toISOString();
    subscription.trialEnd = newTrialEnd;

    // If subscription was LOCKED, GRACE_PERIOD, or CANCELED, return to TRIALING
    if (
      subscription.status === SubscriptionStatusEnum.LOCKED ||
      subscription.status === SubscriptionStatusEnum.GRACE_PERIOD ||
      subscription.status === SubscriptionStatusEnum.CANCELED
    ) {
      subscription.status = SubscriptionStatusEnum.TRIALING;
    }

    await this.subscriptionRepo.save(subscription);

    // Broadcast realtime event
    try {
      const realtimeMessage: EventMessage = {
        channels: [RealtimeRoomBuilder.lab(labId)],
        event: RealtimeChannelEnum.SUBSCRIPTION_UPDATED,
        timestamp: new Date().toISOString(),
        traceId: randomUUID(),
        payload: {
          labId,
          trialEnd: newTrialEnd.toISOString(),
          status: subscription.status,
          extendedBy: adminEmail,
        },
      };
      this.eventsGateway.publishToClients(realtimeMessage);
    } catch (wsErr: any) {
      this.logger.warn(`Failed to broadcast trial extension: ${wsErr.message}`);
    }

    this.logger.log(
      `[Trial Extended] Lab: ${labId} | +${dto.days} days | NewEnd: ${newTrialEnd.toISOString()} | Admin: ${adminEmail} | Reason: ${dto.reason || 'N/A'}`,
    );

    return {
      success: true,
      labId,
      previousTrialEnd,
      newTrialEnd: newTrialEnd.toISOString(),
      daysAdded: dto.days,
      status: subscription.status,
    };
  }
}
