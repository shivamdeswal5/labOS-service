import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from 'src/modules/notifications/domain/notification/notification-log.entity';
import {
  INotificationLogRepository,
  ListNotificationLogsFilters,
} from 'src/modules/notifications/domain/notification/interfaces/notification-log-repository.interface';

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
      qb.andWhere('log.channel = :channel', { channel: filters.channel });
    }

    if (filters?.status !== undefined) {
      qb.andWhere('log.status = :status', { status: filters.status });
    }

    if (filters?.recipientType !== undefined) {
      qb.andWhere('log.recipient_type = :recipientType', {
        recipientType: filters.recipientType,
      });
    }

    if (filters?.notificationType !== undefined) {
      qb.andWhere('log.notification_type = :notificationType', {
        notificationType: filters.notificationType,
      });
    }

    if (filters?.destination) {
      qb.andWhere('log.destination LIKE :destination', {
        destination: `%${filters.destination}%`,
      });
    }

    return qb
      .orderBy('log.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }
}
