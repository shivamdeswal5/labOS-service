import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  ArrayMinSize,
  MaxLength,
  IsNumber,
  Min,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';
import { PaymentMethodEnum } from 'src/modules/billing/domain/invoice/enums/payment-method.enum';

export class CreateReportBillingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;

  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  paymentStatus?: PaymentStatusEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  reportNumber?: string;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateReportBillingDto)
  billing?: CreateReportBillingDto;
}
