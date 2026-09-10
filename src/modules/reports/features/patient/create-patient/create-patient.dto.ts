import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  patientNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  age?: string | null;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @IsOptional()
  @IsEnum(SexEnum)
  sex?: SexEnum;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;
}
