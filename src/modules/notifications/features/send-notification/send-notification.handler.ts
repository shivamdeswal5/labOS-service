import { Inject, Injectable } from '@nestjs/common';
import { SendNotificationCommand } from './send-notification.command';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY,
} from '../../domain/notification/interfaces/notification-log-repository.interface';
import {
  INotificationProvider,
  NOTIFICATION_PROVIDER,
} from '../../infrastructure/providers/interfaces/notification-provider.interface';
import { NotificationTemplateService } from '../../domain/templates/notification-template.service';
import { NotificationLog } from '../../domain/notification/notification-log.entity';
import { NotificationStatusEnum } from '../../domain/notification/enums/notification-status.enum';

@Injectable()
export class SendNotificationHandler {
  constructor(
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly logRepo: INotificationLogRepository,
    @Inject(NOTIFICATION_PROVIDER)
    private readonly provider: INotificationProvider,
    private readonly templateService: NotificationTemplateService,
  ) {}

  async execute(command: SendNotificationCommand): Promise<NotificationLog> {
    const { labId, dto } = command;

    const messageContent =
      dto.message ||
      this.templateService.render(dto.notificationType, {
        patientName: dto.recipientName,
        ...dto.payload,
      });

    const result = await this.provider.send({
      to: dto.destination,
      recipientName: dto.recipientName,
      channel: dto.channel,
      message: messageContent,
      metadata: dto.payload,
    });

    const log = new NotificationLog();
    log.labId = labId;
    log.recipientType = dto.recipientType;
    log.recipientName = dto.recipientName;
    log.destination = dto.destination;
    log.channel = dto.channel;
    log.notificationType = dto.notificationType;
    log.status = result.success
      ? NotificationStatusEnum.SENT
      : NotificationStatusEnum.FAILED;
    log.messageContent = messageContent;
    log.payload = dto.payload || null;
    log.provider = result.provider;
    log.providerMessageId = result.providerMessageId || null;
    log.sentAt = result.success ? new Date() : null;
    log.failureReason = result.error || null;

    return this.logRepo.save(log);
  }
}
