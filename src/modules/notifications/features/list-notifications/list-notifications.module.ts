import { Module } from '@nestjs/common';
import { NotificationsDatabaseModule } from '../../infrastructure/database/notifications-database.module';
import { ListNotificationsController } from './list-notifications.controller';
import { ListNotificationsHandler } from './list-notifications.handler';

@Module({
  imports: [NotificationsDatabaseModule],
  controllers: [ListNotificationsController],
  providers: [ListNotificationsHandler],
  exports: [ListNotificationsHandler],
})
export class ListNotificationsModule {}
