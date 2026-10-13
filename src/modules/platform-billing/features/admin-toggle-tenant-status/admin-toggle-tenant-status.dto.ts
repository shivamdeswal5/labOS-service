import { IsIn, IsOptional, IsString } from 'class-validator';

export class AdminToggleTenantStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED', 'LOCKED'])
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

  @IsOptional()
  @IsString()
  reason?: string;
}
