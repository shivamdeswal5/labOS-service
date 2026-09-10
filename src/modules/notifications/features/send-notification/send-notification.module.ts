import { Module } from '@nestjs/common';
import { NotificationsDatabaseModule } from '../../infrastructure/database/notifications-database.module';
import { NotificationProvidersModule } from '../../infrastructure/providers/notification-providers.module';
import { SendNotificationController } from './send-notification.controller';
import { SendNotificationHandler } from './send-notification.handler';
import { NotificationTemplateService } from '../../domain/templates/notification-template.service';

@Module({
  imports: [NotificationsDatabaseModule, NotificationProvidersModule],
  controllers: [SendNotificationController],
  providers: [SendNotificationHandler, NotificationTemplateService],
  exports: [SendNotificationHandler],
})
export class SendNotificationModule {}
