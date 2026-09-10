import { IsNotEmpty, IsUUID, IsNumber, IsString } from 'class-validator';

export class RecordManualCommissionDto {
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  notes: string;
}
