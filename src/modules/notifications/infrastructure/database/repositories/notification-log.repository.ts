import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from 'src/modules/notifications/domain/notification/notification-log.entity';
import {
  INotificationLogRepository,
  ListNotificationLogsFilters,
} from 'src/modules/notifications/domain/notification/interfaces/notification-log-repository.interface';
import {
  NotificationChannelEnum,
  NotificationChannelEnumMapper,
} from 'src/modules/notifications/domain/notification/enums/notification-channel.enum';
import {
  NotificationStatusEnum,
  NotificationStatusEnumMapper,
} from 'src/modules/notifications/domain/notification/enums/notification-status.enum';
import {
  NotificationTypeEnum,
  NotificationTypeEnumMapper,
} from 'src/modules/notifications/domain/notification/enums/notification-type.enum';
import {
  RecipientTypeEnum,
  RecipientTypeEnumMapper,
} from 'src/modules/notifications/domain/notification/enums/recipient-type.enum';

@Injectable()
export class NotificationLogRepository implements INotificationLogRepository {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly repo: Repository<NotificationLog>,
  ) {}

  async save(log: NotificationLog): Promise<NotificationLog> {
    return this.repo.save(log);
  }

  async findById(id: string, labId: string): Promise<NotificationLog | null> {
    return this.repo.findOne({
      where: { id, labId },
    });
  }

  async findAll(
    labId: string,
    filters?: ListNotificationLogsFilters,
  ): Promise<[NotificationLog[], number]> {
    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    const limit = filters?.limit && filters.limit > 0 ? filters.limit : 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('log')
      .where('log.lab_id = :labId', { labId })
      .andWhere('log.deleted_at IS NULL');

    if (filters?.channel !== undefined) {
      const channelVal =
        typeof filters.channel === 'string'
          ? (NotificationChannelEnumMapper[
              filters.channel as NotificationChannelEnum
            ] ?? filters.channel)
          : filters.channel;
      qb.andWhere('log.channel = :channel', { channel: channelVal });
    }

    if (filters?.status !== undefined) {
      const statusVal =
        typeof filters.status === 'string'
          ? (NotificationStatusEnumMapper[
              filters.status as NotificationStatusEnum
            ] ?? filters.status)
          : filters.status;
      qb.andWhere('log.status = :status', { status: statusVal });
    }

    if (filters?.recipientType !== undefined) {
      const recipientVal =
        typeof filters.recipientType === 'string'
          ? (RecipientTypeEnumMapper[
              filters.recipientType as RecipientTypeEnum
            ] ?? filters.recipientType)
          : filters.recipientType;
      qb.andWhere('log.recipient_type = :recipientType', {
        recipientType: recipientVal,
      });
    }

    if (filters?.notificationType !== undefined) {
      const notifTypeVal =
        typeof filters.notificationType === 'string'
          ? (NotificationTypeEnumMapper[
              filters.notificationType as NotificationTypeEnum
            ] ?? filters.notificationType)
          : filters.notificationType;
      qb.andWhere('log.notification_type = :notificationType', {
        notificationType: notifTypeVal,
      });
    }

    if (filters?.destination) {
      qb.andWhere('log.destination LIKE :destination', {
        destination: `%${filters.destination}%`,
      });
    }

    if (filters?.reportId) {
      qb.andWhere("log.payload->>'reportId' = :reportId", {
        reportId: filters.reportId,
      });
    }

    return qb
      .orderBy('log.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }
}
