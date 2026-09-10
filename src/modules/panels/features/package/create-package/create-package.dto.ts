import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty({ message: 'Package name is required' })
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsArray()
  @IsUUID('4', { each: true, message: 'Each panel ID must be a valid UUID' })
  @IsNotEmpty({ message: 'A package must contain at least one test panel' })
  panelIds: string[];
}
