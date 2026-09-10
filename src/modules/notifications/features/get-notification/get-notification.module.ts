import { Module } from '@nestjs/common';
import { NotificationsDatabaseModule } from '../../infrastructure/database/notifications-database.module';
import { GetNotificationController } from './get-notification.controller';
import { GetNotificationHandler } from './get-notification.handler';

@Module({
  imports: [NotificationsDatabaseModule],
  controllers: [GetNotificationController],
  providers: [GetNotificationHandler],
  exports: [GetNotificationHandler],
})
export class GetNotificationModule {}
