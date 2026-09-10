import { Inject, Injectable } from '@nestjs/common';
import { ListNotificationsQuery } from './list-notifications.query';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY,
} from '../../domain/notification/interfaces/notification-log-repository.interface';
import { NotificationLog } from '../../domain/notification/notification-log.entity';

export interface ListNotificationsResult {
  data: NotificationLog[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListNotificationsHandler {
  constructor(
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly logRepo: INotificationLogRepository,
  ) {}

  async execute(
    query: ListNotificationsQuery,
  ): Promise<ListNotificationsResult> {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 20;

    const [data, total] = await this.logRepo.findAll(query.labId, {
      channel: query.channel,
      status: query.status,
      recipientType: query.recipientType,
      notificationType: query.notificationType,
      destination: query.destination,
      page,
      limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
