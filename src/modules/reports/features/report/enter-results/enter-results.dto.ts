import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ResultValueDto {
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

export class EnterResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one result value is required' })
  @Type(() => ResultValueDto)
  values: ResultValueDto[];
}
