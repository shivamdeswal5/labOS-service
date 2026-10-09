import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';
import { PlanSlugEnum, BillingCycleEnum } from '../../domain/enums/platform-billing.enums';

export class AdminManualActivationDto {
  @IsUUID()
  @IsNotEmpty()
  labId: string;

  @IsEnum(PlanSlugEnum)
  @IsNotEmpty()
  planSlug: PlanSlugEnum;

  @IsEnum(BillingCycleEnum)
  @IsNotEmpty()
  billingCycle: BillingCycleEnum;

  @IsString()
  @IsNotEmpty()
  @Length(6, 35)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Bank UTR must contain only alphanumeric characters, dashes, or underscores',
  })
  utrNumber: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
