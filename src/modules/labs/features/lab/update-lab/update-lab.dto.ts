import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ReportLanguageEnum } from 'src/modules/labs/domain/lab/enums/report-language.enum';

export class UpdateLabDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phoneNumbers?: string[];

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}){1,2}$/)
  accentColor?: string;

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
  reportLanguage?: ReportLanguageEnum;
}
