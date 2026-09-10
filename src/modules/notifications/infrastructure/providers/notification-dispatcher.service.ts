import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INotificationProvider,
  SendNotificationPayload,
  SendNotificationResult,
} from './interfaces/notification-provider.interface';
import { MockNotificationProvider } from './mock-notification.provider';
import { WhatsAppCloudProvider } from './whatsapp-cloud.provider';

@Injectable()
export class NotificationDispatcherService implements INotificationProvider {
  private readonly logger = new Logger(NotificationDispatcherService.name);
  readonly name = 'dispatcher';

  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockNotificationProvider,
    private readonly whatsAppCloudProvider: WhatsAppCloudProvider,
  ) {}

  async send(payload: SendNotificationPayload): Promise<SendNotificationResult> {
    const configuredProvider = this.configService.get<string>(
      'NOTIFICATION_PROVIDER',
      'mock',
    );

    if (configuredProvider === 'whatsapp_cloud') {
      const result = await this.whatsAppCloudProvider.send(payload);
      if (!result.success) {
        this.logger.warn(
          `Primary WhatsApp provider failed: ${result.error}. Falling back to mock provider for logging.`,
        );
        return this.mockProvider.send(payload);
      }
      return result;
    }

    return this.mockProvider.send(payload);
  }
}
