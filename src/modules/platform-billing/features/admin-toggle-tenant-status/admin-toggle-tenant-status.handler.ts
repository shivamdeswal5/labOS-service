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
import { AdminToggleTenantStatusCommand } from './admin-toggle-tenant-status.command';
import { SubscriptionStatusEnum, BillingCycleEnum, PlanSlugEnum } from '../../domain/enums/platform-billing.enums';
import { SubscriptionNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';

export interface AdminToggleTenantStatusResult {
  success: boolean;
  labId: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
}

@Injectable()
export class AdminToggleTenantStatusHandler {
  private readonly logger = new Logger(AdminToggleTenantStatusHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async execute(command: AdminToggleTenantStatusCommand): Promise<AdminToggleTenantStatusResult> {
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

    const previousStatus = subscription.status;
    const targetStatus = dto.status as SubscriptionStatusEnum;

    subscription.status = targetStatus;
    await this.subscriptionRepo.save(subscription);


    // Broadcast realtime event to lab workstation
    try {
      const channel =
        targetStatus === SubscriptionStatusEnum.SUSPENDED || targetStatus === SubscriptionStatusEnum.LOCKED
          ? RealtimeChannelEnum.SUBSCRIPTION_LOCKED
          : RealtimeChannelEnum.SUBSCRIPTION_UPDATED;

      const realtimeMessage: EventMessage = {
        channels: [RealtimeRoomBuilder.lab(labId)],
        event: channel,
        timestamp: new Date().toISOString(),
        traceId: randomUUID(),
        payload: {
          labId,
          status: targetStatus,
          reason: dto.reason || 'Administrative status change',
          updatedBy: adminEmail,
        },
      };
      this.eventsGateway.publishToClients(realtimeMessage);
    } catch (wsErr: any) {
      this.logger.warn(`Failed to broadcast tenant status toggle: ${wsErr.message}`);
    }

    this.logger.log(
      `[Tenant Status Changed] Lab: ${labId} | ${previousStatus} -> ${targetStatus} | Admin: ${adminEmail} | Reason: ${dto.reason || 'N/A'}`,
    );

    return {
      success: true,
      labId,
      previousStatus,
      newStatus: targetStatus,
      updatedAt: new Date().toISOString(),
    };
  }
}
