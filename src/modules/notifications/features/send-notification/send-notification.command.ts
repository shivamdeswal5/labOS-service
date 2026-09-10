import { SendNotificationDto } from './send-notification.dto';

export class SendNotificationCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: SendNotificationDto,
  ) {}
}
