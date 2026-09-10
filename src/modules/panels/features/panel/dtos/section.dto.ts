import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ParameterDto } from './parameter.dto';

export class SectionDto {
  @IsString()
  @IsNotEmpty({ message: 'Section name is required' })
  name: string;

  @IsOptional()
  @IsInt()
  sortOrder: number = 0;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDto)
  parameters: ParameterDto[] = [];
}
