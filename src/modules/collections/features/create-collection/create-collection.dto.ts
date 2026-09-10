import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
} from 'class-validator';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';

export class CreateCollectionDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @IsOptional()
  @IsString()
  patientAge?: string;

  @IsOptional()
  @IsEnum(SexEnum)
  patientSex?: SexEnum;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  preferredDate: string;

  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @IsOptional()
  @IsBoolean()
  isFastingRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testNames?: string[];

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsUUID()
  assignedPhlebotomistId?: string;

  @IsOptional()
  @IsString()
  assignedPhlebotomistName?: string;
}
