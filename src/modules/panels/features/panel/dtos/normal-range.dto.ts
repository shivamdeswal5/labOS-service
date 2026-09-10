import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NormalRangeTypeEnum } from 'src/modules/panels/domain/panel/enums/normal-range-type.enum';

export class GenderRangeDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class StructuredNormalRangeDto {
  @IsEnum(NormalRangeTypeEnum, {
    message: 'Type must be numeric, text, or gender_specific',
  })
  type: NormalRangeTypeEnum;

  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => GenderRangeDto)
  male?: GenderRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GenderRangeDto)
  female?: GenderRangeDto;

  @IsOptional()
  @IsString()
  text?: string;
}
