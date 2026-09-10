import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  qualification?: string | null;

  @IsOptional()
  @IsString()
  signatureUrl?: string | null;
}
