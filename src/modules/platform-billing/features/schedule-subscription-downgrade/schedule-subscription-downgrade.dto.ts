import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BillingCycleEnum, PlanSlugEnum } from '../../domain/enums/platform-billing.enums';

export class ScheduleSubscriptionDowngradeDto {
  @IsNotEmpty()
  @IsEnum(PlanSlugEnum)
  planSlug: PlanSlugEnum;

  @IsOptional()
  @IsEnum(BillingCycleEnum)
  billingCycle?: BillingCycleEnum;
}
