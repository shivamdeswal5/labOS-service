import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ParameterOverrideDto {
  @IsString()
  parameterId: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  isOutOfRange?: boolean;
}

export class GenerateClinicalRemarksDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterOverrideDto)
  draftValues?: ParameterOverrideDto[];
}
