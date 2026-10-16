import { IsEnum, IsNotEmpty } from 'class-validator';
import { BillingCycleEnum, PlanSlugEnum } from '../../domain/enums/platform-billing.enums';

export class PreviewSubscriptionTransitionDto {
  @IsNotEmpty()
  @IsEnum(PlanSlugEnum)
  planSlug: PlanSlugEnum;

  @IsNotEmpty()
  @IsEnum(BillingCycleEnum)
  billingCycle: BillingCycleEnum;
}

export type TransitionType =
  | 'SAME_PLAN'
  | 'UPGRADE'
  | 'DOWNGRADE'
  | 'CYCLE_CHANGE'
  | 'NEW_ACTIVATION';

export interface TransitionPreviewResponseDto {
  allowed: boolean;
  reason: string | null;
  transitionType: TransitionType;
  isImmediate: boolean;
  effectiveDate: string;
  currentPlan: {
    id: string;
    slug: PlanSlugEnum;
    name: string;
    priceInr: number;
    billingCycle: BillingCycleEnum;
    periodEnd: string | null;
    daysRemaining: number;
  } | null;
  targetPlan: {
    id: string;
    slug: PlanSlugEnum;
    name: string;
    priceInr: number;
    billingCycle: BillingCycleEnum;
  };
  prorationCreditInPaise: number;
  grossAmountInPaise: number;
  taxGstInPaise: number;
  netAmountInPaise: number;
  explanation: string;
}
