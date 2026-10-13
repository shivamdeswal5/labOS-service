import { IsOptional, IsString, IsInt, Min, IsBoolean, IsObject } from 'class-validator';

export class AdminUpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyPriceInr?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearlyPriceInr?: number;

  @IsOptional()
  @IsObject()
  featureEntitlements?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
