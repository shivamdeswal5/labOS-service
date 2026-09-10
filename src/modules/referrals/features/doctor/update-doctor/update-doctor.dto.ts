import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsEmail,
  Min,
} from 'class-validator';
import { CommissionTypeEnum } from 'src/modules/referrals/domain/doctor/enums/commission-type.enum';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  clinic?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(CommissionTypeEnum)
  commissionType?: CommissionTypeEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionValue?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
