import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class AdminExtendTrialDto {
  @IsInt()
  @Min(1)
  @Max(365)
  days: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
