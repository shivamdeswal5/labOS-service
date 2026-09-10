import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NOTIFICATION_PROVIDER } from './interfaces/notification-provider.interface';
import { MockNotificationProvider } from './mock-notification.provider';
import { WhatsAppCloudProvider } from './whatsapp-cloud.provider';
import { NotificationDispatcherService } from './notification-dispatcher.service';

@Module({
  imports: [ConfigModule],
  providers: [
    MockNotificationProvider,
    WhatsAppCloudProvider,
    NotificationDispatcherService,
    {
      provide: NOTIFICATION_PROVIDER,
      useExisting: NotificationDispatcherService,
    },
  ],
  exports: [NOTIFICATION_PROVIDER],
})
export class NotificationProvidersModule {}
