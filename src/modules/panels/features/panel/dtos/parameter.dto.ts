import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ParameterInputTypeEnum } from 'src/modules/panels/domain/panel/enums/parameter-input-type.enum';
import { StructuredNormalRangeDto } from './normal-range.dto';

export class ParameterDto {
  @IsString()
  @IsNotEmpty({ message: 'Parameter name is required' })
  name: string;

  @IsOptional()
  @IsString()
  nameLocal?: string | null;

  @IsOptional()
  @IsString()
  unit?: string | null;

  @IsOptional()
  @IsEnum(ParameterInputTypeEnum)
  inputType: ParameterInputTypeEnum = ParameterInputTypeEnum.NUMBER;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[] | null;

  @IsOptional()
  @IsString()
  method?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => StructuredNormalRangeDto)
  normalRange?: StructuredNormalRangeDto | null;

  @IsOptional()
  @IsInt()
  sortOrder: number = 0;
}
