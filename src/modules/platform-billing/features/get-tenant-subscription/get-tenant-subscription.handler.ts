import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetTenantSubscriptionQuery } from './get-tenant-subscription.query';
import { TenantSubscriptionResponseDto } from './get-tenant-subscription.dto';
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
export class GetTenantSubscriptionHandler {
  private readonly logger = new Logger(GetTenantSubscriptionHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
  ) {}

  async execute(query: GetTenantSubscriptionQuery): Promise<TenantSubscriptionResponseDto> {
    let subscription = await this.subRepo.findByLabId(query.labId);

    // JIT Self-Healing: If lab exists but is missing a subscription record, auto-provision 14-day trial
    if (!subscription) {
      this.logger.log(`[JIT Self-Healing] Lab ${query.labId} has no subscription record. Provisioning 14-day trial.`);
      let starterPlan = await this.planRepo.findBySlug(PlanSlugEnum.STARTER);
      if (!starterPlan) {
        const allPlans = await this.planRepo.findAll();
        starterPlan = allPlans[0] || null;
      }

      if (starterPlan) {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const newSub = this.subRepo.create({
          labId: query.labId,
          planId: starterPlan.id,
          status: SubscriptionStatusEnum.TRIALING,
          billingCycle: BillingCycleEnum.MONTHLY,
          trialStart: now,
          trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          gracePeriodEnd: null,
        });
        subscription = await this.subRepo.save(newSub);
        subscription.plan = starterPlan;
      }
    }

    // Accurately compute days remaining in Indian Standard Time / UTC aligned days
    const now = new Date();
    let daysRemaining = 0;
    if (subscription?.status === SubscriptionStatusEnum.ACTIVE && subscription.currentPeriodEnd) {
      daysRemaining = Math.max(
        0,
        Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
    } else if (subscription?.trialEnd) {
      daysRemaining = Math.max(
        0,
        Math.ceil(
          (new Date(subscription.trialEnd).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
    }

    return TenantSubscriptionResponseDto.from(subscription, daysRemaining);
  }
}
