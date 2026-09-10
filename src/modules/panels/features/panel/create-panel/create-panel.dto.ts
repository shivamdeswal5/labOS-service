import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SectionDto } from '../dtos/section.dto';

export class CreatePanelDto {
  @IsString()
  @IsNotEmpty({ message: 'Panel name is required' })
  @MinLength(2, { message: 'Panel name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @MinLength(2)
  category: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number = 0;

  @IsOptional()
  @IsInt()
  sortOrder: number = 0;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[] = [];
}
