import { IsOptional, IsString } from 'class-validator';

export class ResendNotificationDto {
  @IsOptional()
  @IsString()
  destination?: string;
}
