import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AmendValueDto {
  @IsUUID()
  @IsNotEmpty()
  parameterId: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsString()
  remarks?: string | null;
}

export class AmendReportDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Reason for amendment must be at least 5 characters' })
  reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one parameter value must be provided' })
  @Type(() => AmendValueDto)
  values: AmendValueDto[];
}
