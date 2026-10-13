import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LabCreatedEvent } from 'src/modules/labs/domain/lab/events/lab-created.event';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';
import {
  SubscriptionStatusEnum,
  BillingCycleEnum,
  PlanSlugEnum,
} from '../../domain/enums/platform-billing.enums';

@Injectable()
export class LabCreatedProvisionSubscriptionListener {
  private readonly logger = new Logger(LabCreatedProvisionSubscriptionListener.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
  ) {}

  @OnEvent('lab.created')
  async handleLabCreated(event: LabCreatedEvent): Promise<void> {
    try {
      // 1. Idempotency guard: prevent duplicate trial provisioning
      const existing = await this.subRepo.findByLabId(event.labId);
      if (existing) {
        this.logger.log(
          `[Subscription Provisioning] Lab ${event.labId} already has subscription ${existing.id}. Skipping.`,
        );
        return;
      }

      // 2. Resolve Plan with safe fallback to STARTER
      let targetSlug = PlanSlugEnum.STARTER;
      if (
        event.planSlug &&
        Object.values(PlanSlugEnum).includes(event.planSlug.toUpperCase() as PlanSlugEnum)
      ) {
        targetSlug = event.planSlug.toUpperCase() as PlanSlugEnum;
      }

      let plan = await this.planRepo.findBySlug(targetSlug);
      if (!plan) {
        this.logger.warn(
          `Requested plan ${targetSlug} not found. Falling back to ${PlanSlugEnum.STARTER}.`,
        );
        plan = await this.planRepo.findBySlug(PlanSlugEnum.STARTER);
      }

      if (!plan) {
        this.logger.error(`Critical: Default ${PlanSlugEnum.STARTER} plan not found in database.`);
        return;
      }

      // 3. Resolve Billing Cycle
      const billingCycle =
        event.billingCycle?.toUpperCase() === 'YEARLY'
          ? BillingCycleEnum.YEARLY
          : BillingCycleEnum.MONTHLY;

      // 4. Provision 14-day Free Trial
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      const trialSub = this.subRepo.create({
        labId: event.labId,
        planId: plan.id,
        status: SubscriptionStatusEnum.TRIALING,
        billingCycle,
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        gracePeriodEnd: null,
      });

      await this.subRepo.save(trialSub);

      this.logger.log(
        `[14-Day Trial Provisioned] Lab: "${event.labName}" (${event.labId}) | Plan: ${plan.name} (${plan.slug}) | Validity: 14 days (ends ${trialEnd.toISOString()})`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to provision subscription for newly created lab ${event.labId}: ${message}`,
      );
    }
  }
}
