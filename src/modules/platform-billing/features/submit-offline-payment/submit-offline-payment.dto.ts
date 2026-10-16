import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class SubmitOfflinePaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{12}$/, {
    message: 'UTR must be a valid 12-digit numeric reference number',
  })
  utrNumber: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
