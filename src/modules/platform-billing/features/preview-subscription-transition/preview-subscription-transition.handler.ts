import { Inject, Injectable, Logger } from '@nestjs/common';
import { PreviewSubscriptionTransitionQuery } from './preview-subscription-transition.query';
import {
  TransitionPreviewResponseDto,
  TransitionType,
} from './preview-subscription-transition.dto';
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

const PLAN_RANK: Record<PlanSlugEnum, number> = {
  [PlanSlugEnum.STARTER]: 1,
  [PlanSlugEnum.GROWTH]: 2,
  [PlanSlugEnum.SCALE]: 3,
};

const CYCLE_RANK: Record<BillingCycleEnum, number> = {
  [BillingCycleEnum.MONTHLY]: 1,
  [BillingCycleEnum.YEARLY]: 2,
};

@Injectable()
export class PreviewSubscriptionTransitionHandler {
  private readonly logger = new Logger(PreviewSubscriptionTransitionHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
  ) {}

  async execute(query: PreviewSubscriptionTransitionQuery): Promise<TransitionPreviewResponseDto> {
    const { labId, dto } = query;

    const targetPlan = await this.planRepo.findBySlug(dto.planSlug);
    if (!targetPlan) {
      throw new PlanNotFoundException(dto.planSlug);
    }

    const subscription = await this.subRepo.findByLabId(labId);
    const now = new Date();

    const targetPriceInr =
      dto.billingCycle === BillingCycleEnum.YEARLY
        ? targetPlan.yearlyPriceInr
        : targetPlan.monthlyPriceInr;
    const targetPricePaise = targetPriceInr * 100;

    const targetPlanDto = {
      id: targetPlan.id,
      slug: targetPlan.slug as PlanSlugEnum,
      name: targetPlan.name,
      priceInr: targetPriceInr,
      billingCycle: dto.billingCycle,
    };

    const isCurrentActive =
      subscription &&
      subscription.status === SubscriptionStatusEnum.ACTIVE &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd > now;

    if (!isCurrentActive || !subscription.plan) {
      // New activation from trial, grace period, or locked status
      const grossAmountInPaise = targetPricePaise;
      const taxGstInPaise = Math.round(grossAmountInPaise * 0.18);
      const netAmountInPaise = grossAmountInPaise + taxGstInPaise;

      return {
        allowed: true,
        reason: null,
        transitionType: 'NEW_ACTIVATION',
        isImmediate: true,
        effectiveDate: now.toISOString(),
        currentPlan: null,
        targetPlan: targetPlanDto,
        prorationCreditInPaise: 0,
        grossAmountInPaise,
        taxGstInPaise,
        netAmountInPaise,
        explanation: `Activate ${targetPlan.name} (${dto.billingCycle.toLowerCase()}). Instant access upon authorization.`,
      };
    }

    // Active paid plan transition analysis
    const currentPlan = subscription.plan;
    const currentCycle = subscription.billingCycle || BillingCycleEnum.MONTHLY;
    const currentPriceInr =
      currentCycle === BillingCycleEnum.YEARLY
        ? currentPlan.yearlyPriceInr
        : currentPlan.monthlyPriceInr;

    const currentRank = PLAN_RANK[currentPlan.slug as PlanSlugEnum] || 1;
    const targetRank = PLAN_RANK[targetPlan.slug as PlanSlugEnum] || 1;

    const currentCycleRank = CYCLE_RANK[currentCycle] || 1;
    const targetCycleRank = CYCLE_RANK[dto.billingCycle] || 1;

    const daysRemaining = Math.max(
      0,
      Math.ceil((subscription.currentPeriodEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const currentPlanDto = {
      id: currentPlan.id,
      slug: currentPlan.slug as PlanSlugEnum,
      name: currentPlan.name,
      priceInr: currentPriceInr,
      billingCycle: currentCycle,
      periodEnd: subscription.currentPeriodEnd!.toISOString(),
      daysRemaining,
    };

    // 1. Same Plan and Cycle: Stacking guard
    if (currentPlan.slug === targetPlan.slug && currentCycle === dto.billingCycle) {
      return {
        allowed: false,
        reason: `Your laboratory is currently active on the ${currentPlan.name} (${currentCycle.toLowerCase()}) plan.`,
        transitionType: 'SAME_PLAN',
        isImmediate: false,
        effectiveDate: subscription.currentPeriodEnd!.toISOString(),
        currentPlan: currentPlanDto,
        targetPlan: targetPlanDto,
        prorationCreditInPaise: 0,
        grossAmountInPaise: 0,
        taxGstInPaise: 0,
        netAmountInPaise: 0,
        explanation: `You are already subscribed to ${currentPlan.name}. Renewal date: ${subscription.currentPeriodEnd!.toLocaleDateString('en-IN')}.`,
      };
    }

    // 2. Downgrade: Lower tier, or same tier with Yearly -> Monthly
    const isTierDowngrade = targetRank < currentRank;
    const isCycleDowngrade = targetRank === currentRank && targetCycleRank < currentCycleRank;

    if (isTierDowngrade || isCycleDowngrade) {
      const renewalDateFormatted = subscription.currentPeriodEnd!.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      return {
        allowed: true,
        reason: null,
        transitionType: 'DOWNGRADE',
        isImmediate: false,
        effectiveDate: subscription.currentPeriodEnd!.toISOString(),
        currentPlan: currentPlanDto,
        targetPlan: targetPlanDto,
        prorationCreditInPaise: 0,
        grossAmountInPaise: 0,
        taxGstInPaise: 0,
        netAmountInPaise: 0,
        explanation: `Downgrade to ${targetPlan.name} is scheduled for ${renewalDateFormatted}. You will retain all ${currentPlan.name} features and limits until your current billing period ends. No payment is charged today.`,
      };
    }

    // 3. Upgrade (Tier upgrade or Monthly -> Yearly on same tier)
    const totalPeriodMs =
      subscription.currentPeriodStart && subscription.currentPeriodEnd
        ? Math.max(1, subscription.currentPeriodEnd.getTime() - subscription.currentPeriodStart.getTime())
        : 30 * 24 * 60 * 60 * 1000;

    const remainingMs = Math.max(0, subscription.currentPeriodEnd!.getTime() - now.getTime());
    const fraction = Math.min(1, remainingMs / totalPeriodMs);

    const currentPricePaise = currentPriceInr * 100;
    const rawCreditPaise = Math.round(fraction * currentPricePaise);
    const prorationCreditInPaise = Math.min(targetPricePaise, rawCreditPaise);

    const grossAmountInPaise = Math.max(0, targetPricePaise - prorationCreditInPaise);
    const taxGstInPaise = Math.round(grossAmountInPaise * 0.18);
    const netAmountInPaise = grossAmountInPaise + taxGstInPaise;

    const transitionType: TransitionType =
      targetRank > currentRank ? 'UPGRADE' : 'CYCLE_CHANGE';

    const creditInrFormatted = (prorationCreditInPaise / 100).toFixed(0);

    return {
      allowed: true,
      reason: null,
      transitionType,
      isImmediate: true,
      effectiveDate: now.toISOString(),
      currentPlan: currentPlanDto,
      targetPlan: targetPlanDto,
      prorationCreditInPaise,
      grossAmountInPaise,
      taxGstInPaise,
      netAmountInPaise,
      explanation:
        prorationCreditInPaise > 0
          ? `Immediate upgrade to ${targetPlan.name}. An unused credit of ₹${creditInrFormatted} from your current plan is deducted from today's invoice.`
          : `Immediate upgrade to ${targetPlan.name}. All new capabilities and limits unlocked immediately.`,
    };
  }
}
