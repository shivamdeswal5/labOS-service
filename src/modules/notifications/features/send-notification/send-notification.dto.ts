import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { NotificationChannelEnum } from '../../domain/notification/enums/notification-channel.enum';
import { NotificationTypeEnum } from '../../domain/notification/enums/notification-type.enum';
import { RecipientTypeEnum } from '../../domain/notification/enums/recipient-type.enum';

export class SendNotificationDto {
  @IsEnum(RecipientTypeEnum)
  recipientType: RecipientTypeEnum;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsEnum(NotificationChannelEnum)
  channel: NotificationChannelEnum;

  @IsEnum(NotificationTypeEnum)
  notificationType: NotificationTypeEnum;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
