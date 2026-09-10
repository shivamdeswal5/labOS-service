import { IsOptional, IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class SettleCommissionDto {
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  entryIds?: string[];
}
