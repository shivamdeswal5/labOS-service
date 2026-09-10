import { NotificationChannelEnum } from '../../domain/notification/enums/notification-channel.enum';
import { NotificationStatusEnum } from '../../domain/notification/enums/notification-status.enum';
import { NotificationTypeEnum } from '../../domain/notification/enums/notification-type.enum';
import { RecipientTypeEnum } from '../../domain/notification/enums/recipient-type.enum';

export class ListNotificationsQuery {
  constructor(
    public readonly labId: string,
    public readonly channel?: NotificationChannelEnum,
    public readonly status?: NotificationStatusEnum,
    public readonly recipientType?: RecipientTypeEnum,
    public readonly notificationType?: NotificationTypeEnum,
    public readonly destination?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
