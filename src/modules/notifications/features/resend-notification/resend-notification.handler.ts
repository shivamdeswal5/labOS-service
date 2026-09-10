import { Inject, Injectable } from '@nestjs/common';
import { ResendNotificationCommand } from './resend-notification.command';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY,
} from '../../domain/notification/interfaces/notification-log-repository.interface';
import {
  INotificationProvider,
  NOTIFICATION_PROVIDER,
} from '../../infrastructure/providers/interfaces/notification-provider.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { NotificationLog } from '../../domain/notification/notification-log.entity';
import { NotificationStatusEnum } from '../../domain/notification/enums/notification-status.enum';

@Injectable()
export class ResendNotificationHandler {
  constructor(
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly logRepo: INotificationLogRepository,
    @Inject(NOTIFICATION_PROVIDER)
    private readonly provider: INotificationProvider,
  ) {}

  async execute(command: ResendNotificationCommand): Promise<NotificationLog> {
    const { labId, notificationId, dto } = command;

    const existingLog = await this.logRepo.findById(notificationId, labId);
    if (!existingLog) {
      throw new EntityNotFoundException('NotificationLog', notificationId);
    }

    const destination = dto?.destination || existingLog.destination;

    const result = await this.provider.send({
      to: destination,
      recipientName: existingLog.recipientName,
      channel: existingLog.channel,
      message: existingLog.messageContent,
      metadata: existingLog.payload || undefined,
    });

    existingLog.destination = destination;
    existingLog.status = result.success
      ? NotificationStatusEnum.SENT
      : NotificationStatusEnum.FAILED;
    existingLog.provider = result.provider;
    existingLog.providerMessageId = result.providerMessageId || null;
    existingLog.sentAt = result.success ? new Date() : null;
    existingLog.failureReason = result.error || null;

    return this.logRepo.save(existingLog);
  }
}
