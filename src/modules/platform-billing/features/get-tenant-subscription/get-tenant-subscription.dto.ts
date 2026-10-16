import { TenantSubscription } from '../../domain/entities/tenant-subscription.entity';
import {
  SubscriptionStatusEnum,
  BillingCycleEnum,
  PlanSlugEnum,
} from '../../domain/enums/platform-billing.enums';

export class TenantSubscriptionResponseDto {
  id: string;
  labId: string;
  planId: string;
  planSlug: PlanSlugEnum;
  planName: string;
  status: SubscriptionStatusEnum;
  billingCycle: BillingCycleEnum;
  trialStart: string;
  trialEnd: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  gracePeriodEnd: string | null;
  daysRemaining: number;
  effectiveEntitlements: Record<string, any>;

  scheduledPlanId: string | null;
  scheduledPlanSlug: PlanSlugEnum | null;
  scheduledPlanName: string | null;
  scheduledBillingCycle: BillingCycleEnum | null;
  scheduledAt: string | null;
  customerGstin: string | null;

  isTrialing: boolean;
  isActive: boolean;
  isGracePeriod: boolean;
  isLocked: boolean;
  isSuspended: boolean;

  static from(
    subscription: TenantSubscription | null,
    daysRemaining: number = 0,
  ): TenantSubscriptionResponseDto {
    const dto = new TenantSubscriptionResponseDto();

    if (!subscription) {
      dto.id = '';
      dto.labId = '';
      dto.planId = '';
      dto.planSlug = PlanSlugEnum.STARTER;
      dto.planName = 'Starter Plan';
      dto.status = SubscriptionStatusEnum.TRIALING;
      dto.billingCycle = BillingCycleEnum.MONTHLY;
      dto.trialStart = new Date().toISOString();
      dto.trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      dto.currentPeriodStart = null;
      dto.currentPeriodEnd = null;
      dto.gracePeriodEnd = null;
      dto.daysRemaining = 14;
      dto.effectiveEntitlements = {};
      dto.scheduledPlanId = null;
      dto.scheduledPlanSlug = null;
      dto.scheduledPlanName = null;
      dto.scheduledBillingCycle = null;
      dto.scheduledAt = null;
      dto.customerGstin = null;
      dto.isTrialing = true;
      dto.isActive = false;
      dto.isGracePeriod = false;
      dto.isLocked = false;
      dto.isSuspended = false;
      return dto;
    }

    dto.id = subscription.id;
    dto.labId = subscription.labId;
    dto.planId = subscription.planId;
    dto.planSlug = (subscription.plan?.slug as PlanSlugEnum) || PlanSlugEnum.STARTER;
    dto.planName = subscription.plan?.name || 'Starter Plan';
    dto.status = subscription.status;
    dto.billingCycle = subscription.billingCycle || BillingCycleEnum.MONTHLY;
    dto.trialStart = subscription.trialStart ? new Date(subscription.trialStart).toISOString() : new Date().toISOString();
    dto.trialEnd = subscription.trialEnd ? new Date(subscription.trialEnd).toISOString() : new Date().toISOString();
    dto.currentPeriodStart = subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart).toISOString() : null;
    dto.currentPeriodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toISOString() : null;
    dto.gracePeriodEnd = subscription.gracePeriodEnd ? new Date(subscription.gracePeriodEnd).toISOString() : null;
    dto.daysRemaining = daysRemaining;

    // Merge plan default entitlements with custom tenant overrides
    dto.effectiveEntitlements = {
      ...subscription.plan?.featureEntitlements,
      ...subscription.customEntitlementOverrides,
    };

    dto.scheduledPlanId = subscription.scheduledPlanId || null;
    dto.scheduledPlanSlug = (subscription.scheduledPlan?.slug as PlanSlugEnum) || null;
    dto.scheduledPlanName = subscription.scheduledPlan?.name || null;
    dto.scheduledBillingCycle = subscription.scheduledBillingCycle || null;
    dto.scheduledAt = subscription.scheduledAt ? new Date(subscription.scheduledAt).toISOString() : null;
    dto.customerGstin = subscription.customerGstin || null;

    dto.isTrialing = subscription.status === SubscriptionStatusEnum.TRIALING;
    dto.isActive = subscription.status === SubscriptionStatusEnum.ACTIVE;
    dto.isGracePeriod = subscription.status === SubscriptionStatusEnum.GRACE_PERIOD;
    dto.isLocked =
      subscription.status === SubscriptionStatusEnum.LOCKED ||
      subscription.status === SubscriptionStatusEnum.SUSPENDED;
    dto.isSuspended = subscription.status === SubscriptionStatusEnum.SUSPENDED;

    return dto;
  }
}
