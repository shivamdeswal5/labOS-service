import { NotificationLog } from '../notification-log.entity';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';
import { NotificationStatusEnum } from '../enums/notification-status.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';
import { RecipientTypeEnum } from '../enums/recipient-type.enum';

export interface ListNotificationLogsFilters {
  channel?: NotificationChannelEnum;
  status?: NotificationStatusEnum;
  recipientType?: RecipientTypeEnum;
  notificationType?: NotificationTypeEnum;
  destination?: string;
  page?: number;
  limit?: number;
}

export interface INotificationLogRepository {
  save(log: NotificationLog): Promise<NotificationLog>;
  findById(id: string, labId: string): Promise<NotificationLog | null>;
  findAll(
    labId: string,
    filters?: ListNotificationLogsFilters,
  ): Promise<[NotificationLog[], number]>;
}

export const NOTIFICATION_LOG_REPOSITORY = Symbol('INotificationLogRepository');
