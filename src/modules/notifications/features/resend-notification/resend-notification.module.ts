import { Module } from '@nestjs/common';
import { NotificationsDatabaseModule } from '../../infrastructure/database/notifications-database.module';
import { NotificationProvidersModule } from '../../infrastructure/providers/notification-providers.module';
import { ResendNotificationController } from './resend-notification.controller';
import { ResendNotificationHandler } from './resend-notification.handler';

@Module({
  imports: [NotificationsDatabaseModule, NotificationProvidersModule],
  controllers: [ResendNotificationController],
  providers: [ResendNotificationHandler],
  exports: [ResendNotificationHandler],
})
export class ResendNotificationModule {}
