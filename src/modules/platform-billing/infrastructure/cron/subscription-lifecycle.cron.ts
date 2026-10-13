import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import { EventsGateway } from 'src/modules/websockets/infrastructure/gateways/events.gateway';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { SubscriptionStatusEnum } from '../../domain/enums/platform-billing.enums';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';

@Injectable()
export class SubscriptionLifecycleCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubscriptionLifecycleCron.name);
  private timer: NodeJS.Timeout | null = null;
  private readonly intervalMs = 60 * 60 * 1000; // 1 hour

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  onModuleInit(): void {
    this.logger.log('SubscriptionLifecycleCron initialized. Monitoring trial & grace period lifecycles.');
    // Initial scan after 2 minutes of boot
    setTimeout(() => {
      this.runLifecycleCheck().catch((err) =>
        this.logger.warn(`Initial subscription lifecycle scan warning: ${err.message}`),
      );
    }, 2 * 60 * 1000);

    // Regular interval
    this.timer = setInterval(() => {
      this.runLifecycleCheck().catch((err) =>
        this.logger.error(`Periodic subscription lifecycle scan error: ${err.message}`),
      );
    }, this.intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runLifecycleCheck(): Promise<{ transitionedCount: number }> {
    const subscriptions = await this.subscriptionRepo.findAll();
    const now = new Date();
    let transitionedCount = 0;

    for (const sub of subscriptions) {
      // 1. Trialing expired -> Transition to 72h Grace Period
      if (
        sub.status === SubscriptionStatusEnum.TRIALING &&
        sub.trialEnd &&
        new Date(sub.trialEnd).getTime() <= now.getTime()
      ) {
        sub.status = SubscriptionStatusEnum.GRACE_PERIOD;
        sub.gracePeriodEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
        await this.subscriptionRepo.save(sub);
        transitionedCount++;

        this.broadcastEvent(sub.labId, RealtimeChannelEnum.SUBSCRIPTION_UPDATED, {
          labId: sub.labId,
          status: sub.status,
          gracePeriodEnd: sub.gracePeriodEnd.toISOString(),
          message: 'Trial period has expired. Laboratory entered 72-hour grace period.',
        });

        this.logger.warn(
          `[Trial Expired] Lab: ${sub.labId} transitioned to GRACE_PERIOD. Grace ends: ${sub.gracePeriodEnd.toISOString()}`,
        );
      }

      // 2. Active expired -> Transition to 72h Grace Period
      else if (
        sub.status === SubscriptionStatusEnum.ACTIVE &&
        sub.currentPeriodEnd &&
        new Date(sub.currentPeriodEnd).getTime() <= now.getTime()
      ) {
        sub.status = SubscriptionStatusEnum.GRACE_PERIOD;
        sub.gracePeriodEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000);
        await this.subscriptionRepo.save(sub);
        transitionedCount++;

        this.broadcastEvent(sub.labId, RealtimeChannelEnum.SUBSCRIPTION_UPDATED, {
          labId: sub.labId,
          status: sub.status,
          gracePeriodEnd: sub.gracePeriodEnd.toISOString(),
          message: 'Subscription period ended. Laboratory entered 72-hour grace period.',
        });

        this.logger.warn(
          `[Active Expired] Lab: ${sub.labId} transitioned to GRACE_PERIOD. Grace ends: ${sub.gracePeriodEnd.toISOString()}`,
        );
      }

      // 3. Grace Period expired -> Transition to LOCKED (intake blocked, read-only reports)
      else if (
        sub.status === SubscriptionStatusEnum.GRACE_PERIOD &&
        sub.gracePeriodEnd &&
        new Date(sub.gracePeriodEnd).getTime() <= now.getTime()
      ) {
        sub.status = SubscriptionStatusEnum.LOCKED;
        await this.subscriptionRepo.save(sub);
        transitionedCount++;

        this.broadcastEvent(sub.labId, RealtimeChannelEnum.SUBSCRIPTION_LOCKED, {
          labId: sub.labId,
          status: sub.status,
          message: 'Grace period has lapsed. Laboratory order intake is now locked.',
        });

        this.logger.warn(`[Grace Period Lapsed] Lab: ${sub.labId} is now LOCKED.`);
      }
    }

    if (transitionedCount > 0) {
      this.logger.log(`Subscription Lifecycle Scan: Transitioned ${transitionedCount} subscriptions.`);
    }

    return { transitionedCount };
  }

  private broadcastEvent(labId: string, event: RealtimeChannelEnum, payload: Record<string, any>) {
    try {
      const message: EventMessage = {
        channels: [RealtimeRoomBuilder.lab(labId)],
        event,
        timestamp: new Date().toISOString(),
        traceId: randomUUID(),
        payload,
      };
      this.eventsGateway.publishToClients(message);
    } catch (err: any) {
      this.logger.warn(`Failed to broadcast lifecycle event for lab ${labId}: ${err.message}`);
    }
  }
}
