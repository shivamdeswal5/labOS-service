import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ReportLanguageEnum } from 'src/modules/labs/domain/lab/enums/report-language.enum';

export class CreateLabDto {
  @IsString()
  @IsNotEmpty({ message: 'Lab name is required' })
  @MinLength(2, { message: 'Lab name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  address: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'At least one phone number is required' })
  phoneNumbers: string[];

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}){1,2}$/, { message: 'Must be a valid hex color' })
  accentColor?: string = '#0f172a';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  footerNote?: string | null;

  @IsOptional()
  @IsEnum(ReportLanguageEnum)
  reportLanguage?: ReportLanguageEnum = ReportLanguageEnum.EN;

  @IsString()
  @IsNotEmpty({ message: 'Owner full name is required' })
  @MinLength(2)
  ownerFullName: string;
}
