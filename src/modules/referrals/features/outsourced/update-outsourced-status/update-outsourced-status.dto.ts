import { IsEnum, IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { OutsourcedTestStatusEnum } from 'src/modules/referrals/domain/outsourced/enums/outsourced-test-status.enum';

export class UpdateOutsourcedStatusDto {
  @IsEnum(OutsourcedTestStatusEnum)
  status: OutsourcedTestStatusEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
