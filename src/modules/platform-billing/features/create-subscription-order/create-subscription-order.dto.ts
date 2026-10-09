import { IsEnum, IsOptional } from 'class-validator';
import { PlanSlugEnum, BillingCycleEnum } from '../../domain/enums/platform-billing.enums';

export class CreateSubscriptionOrderDto {
  @IsEnum(PlanSlugEnum)
  planSlug: PlanSlugEnum;

  @IsOptional()
  @IsEnum(BillingCycleEnum)
  billingCycle?: BillingCycleEnum = BillingCycleEnum.MONTHLY;
}
