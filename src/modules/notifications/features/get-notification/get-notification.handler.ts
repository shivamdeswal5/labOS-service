import { Inject, Injectable } from '@nestjs/common';
import { GetNotificationQuery } from './get-notification.query';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY,
} from '../../domain/notification/interfaces/notification-log-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { NotificationLog } from '../../domain/notification/notification-log.entity';

@Injectable()
export class GetNotificationHandler {
  constructor(
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly logRepo: INotificationLogRepository,
  ) {}

  async execute(query: GetNotificationQuery): Promise<NotificationLog> {
    const { labId, id } = query;
    const log = await this.logRepo.findById(id, labId);
    if (!log) {
      throw new EntityNotFoundException('NotificationLog', id);
    }
    return log;
  }
}
