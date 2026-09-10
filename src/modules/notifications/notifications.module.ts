import { Module } from '@nestjs/common';
import { NotificationsDatabaseModule } from './infrastructure/database/notifications-database.module';
import { NotificationProvidersModule } from './infrastructure/providers/notification-providers.module';
import { ReportsDatabaseModule } from '../reports/infrastructure/database/reports-database.module';
import { SendNotificationModule } from './features/send-notification/send-notification.module';
import { ResendNotificationModule } from './features/resend-notification/resend-notification.module';
import { GetNotificationModule } from './features/get-notification/get-notification.module';
import { ListNotificationsModule } from './features/list-notifications/list-notifications.module';
import { NotificationTemplateService } from './domain/templates/notification-template.service';
import { ReportFinalizedNotificationListener } from './listeners/report-finalized-notification.listener';

@Module({
  imports: [
    NotificationsDatabaseModule,
    NotificationProvidersModule,
    ReportsDatabaseModule,
    SendNotificationModule,
    ResendNotificationModule,
    GetNotificationModule,
    ListNotificationsModule,
  ],
  providers: [
    NotificationTemplateService,
    ReportFinalizedNotificationListener,
  ],
  exports: [
    NotificationsDatabaseModule,
    NotificationProvidersModule,
    NotificationTemplateService,
    SendNotificationModule,
    ResendNotificationModule,
    GetNotificationModule,
    ListNotificationsModule,
  ],
})
export class NotificationsModule {}
