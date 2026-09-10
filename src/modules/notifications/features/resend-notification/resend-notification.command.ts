import { ResendNotificationDto } from './resend-notification.dto';

export class ResendNotificationCommand {
  constructor(
    public readonly labId: string,
    public readonly notificationId: string,
    public readonly dto?: ResendNotificationDto,
  ) {}
}
