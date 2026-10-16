import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PlanSlugEnum, BillingCycleEnum } from '../../domain/enums/platform-billing.enums';

export class CreateSubscriptionOrderDto {
  @IsOptional()
  @IsEnum(PlanSlugEnum)
  planSlug?: PlanSlugEnum;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsEnum(BillingCycleEnum)
  billingCycle?: BillingCycleEnum = BillingCycleEnum.MONTHLY;
}
