import { NotificationChannelEnum } from '../../../domain/notification/enums/notification-channel.enum';

export interface SendNotificationPayload {
  to: string;
  recipientName: string;
  channel: NotificationChannelEnum;
  message: string;
  metadata?: Record<string, any>;
}

export interface SendNotificationResult {
  success: boolean;
  provider: string;
  providerMessageId?: string;
  error?: string;
}

export interface INotificationProvider {
  readonly name: string;
  send(payload: SendNotificationPayload): Promise<SendNotificationResult>;
}

export const NOTIFICATION_PROVIDER = Symbol('INotificationProvider');
