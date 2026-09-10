import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  reportNumber: string;

  @IsOptional()
  @IsUUID()
  refByDoctorId?: string | null;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1, { message: 'At least one panel is required' })
  panelIds: string[];

  @IsOptional()
  @IsString()
  remarks?: string | null;
}
