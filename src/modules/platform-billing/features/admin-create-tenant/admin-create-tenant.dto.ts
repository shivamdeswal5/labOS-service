import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PlanSlugEnum, BillingCycleEnum } from '../../domain/enums/platform-billing.enums';

export enum AdminOnboardPaymentStatusEnum {
  TRIAL = 'TRIAL',
  PAID = 'PAID',
}

export class AdminCreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Lab name is required' })
  @MinLength(2)
  labName: string;

  @IsString()
  @IsNotEmpty({ message: 'City or lab address is required' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Owner full name is required' })
  @MinLength(2)
  ownerFullName: string;

  @IsEmail({}, { message: 'Valid owner email is required' })
  @IsNotEmpty()
  ownerEmail: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  ownerPassword?: string;

  @IsEnum(PlanSlugEnum)
  @IsNotEmpty()
  planSlug: PlanSlugEnum;

  @IsEnum(BillingCycleEnum)
  @IsNotEmpty()
  billingCycle: BillingCycleEnum;

  @IsEnum(AdminOnboardPaymentStatusEnum)
  @IsNotEmpty()
  paymentStatus: AdminOnboardPaymentStatusEnum;

  @IsString()
  @IsOptional()
  utrNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
