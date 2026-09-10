import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from '../../domain/notification/notification-log.entity';
import { NOTIFICATION_LOG_REPOSITORY } from '../../domain/notification/interfaces/notification-log-repository.interface';
import { NotificationLogRepository } from './repositories/notification-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLog])],
  providers: [
    {
      provide: NOTIFICATION_LOG_REPOSITORY,
      useClass: NotificationLogRepository,
    },
  ],
  exports: [NOTIFICATION_LOG_REPOSITORY],
})
export class NotificationsDatabaseModule {}
