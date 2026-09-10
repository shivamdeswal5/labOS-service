import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { ReportFinalizedEvent } from 'src/modules/reports/events/report-finalized.event';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY,
} from '../domain/notification/interfaces/notification-log-repository.interface';
import {
  INotificationProvider,
  NOTIFICATION_PROVIDER,
} from '../infrastructure/providers/interfaces/notification-provider.interface';
import { NotificationTemplateService } from '../domain/templates/notification-template.service';
import { NotificationLog } from '../domain/notification/notification-log.entity';
import { NotificationChannelEnum } from '../domain/notification/enums/notification-channel.enum';
import { NotificationTypeEnum } from '../domain/notification/enums/notification-type.enum';
import { NotificationStatusEnum } from '../domain/notification/enums/notification-status.enum';
import { RecipientTypeEnum } from '../domain/notification/enums/recipient-type.enum';

@Injectable()
export class ReportFinalizedNotificationListener {
  private readonly logger = new Logger(
    ReportFinalizedNotificationListener.name,
  );

  constructor(
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepo: IPatientRepository,
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepo: IReportRepository,
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly notificationLogRepo: INotificationLogRepository,
    @Inject(NOTIFICATION_PROVIDER)
    private readonly notificationProvider: INotificationProvider,
    private readonly templateService: NotificationTemplateService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('report.finalized')
  async handleReportFinalized(event: ReportFinalizedEvent): Promise<void> {
    try {
      const patient = await this.patientRepo.findById(
        event.patientId,
        event.labId,
      );

      if (!patient || !patient.phone) {
        this.logger.log(
          `Skipping report notification for report ${event.reportId}: patient has no phone number`,
        );
        return;
      }

      const report = await this.reportRepo.findById(
        event.reportId,
        event.labId,
      );

      const publicBaseUrl = this.configService.get<string>(
        'APP_PUBLIC_URL',
        'https://labos.app',
      );
      const shareToken = report?.shareToken || '';
      const reportUrl = `${publicBaseUrl}/api/v1/public/reports/${shareToken}`;

      const messageContent = this.templateService.render(
        NotificationTypeEnum.REPORT_READY,
        {
          patientName: patient.name,
          reportUrl,
        },
      );

      const dispatchResult = await this.notificationProvider.send({
        to: patient.phone,
        recipientName: patient.name,
        channel: NotificationChannelEnum.WHATSAPP,
        message: messageContent,
        metadata: {
          reportId: event.reportId,
          reportNumber: event.reportNumber,
          patientId: event.patientId,
        },
      });

      const log = new NotificationLog();
      log.labId = event.labId;
      log.recipientType = RecipientTypeEnum.PATIENT;
      log.recipientName = patient.name;
      log.destination = patient.phone;
      log.channel = NotificationChannelEnum.WHATSAPP;
      log.notificationType = NotificationTypeEnum.REPORT_READY;
      log.status = dispatchResult.success
        ? NotificationStatusEnum.SENT
        : NotificationStatusEnum.FAILED;
      log.messageContent = messageContent;
      log.payload = {
        reportId: event.reportId,
        reportNumber: event.reportNumber,
        shareToken,
        reportUrl,
      };
      log.provider = dispatchResult.provider;
      log.providerMessageId = dispatchResult.providerMessageId || null;
      log.sentAt = dispatchResult.success ? new Date() : null;
      log.failureReason = dispatchResult.error || null;

      await this.notificationLogRepo.save(log);
    } catch (error: any) {
      this.logger.error(
        `Failed to handle report.finalized notification: ${error.message}`,
        error.stack,
      );
    }
  }
}
