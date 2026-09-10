import { Entity, Column, Index } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import {
  NotificationChannelEnum,
  NotificationChannelEnumMapper,
} from './enums/notification-channel.enum';
import {
  NotificationTypeEnum,
  NotificationTypeEnumMapper,
} from './enums/notification-type.enum';
import {
  NotificationStatusEnum,
  NotificationStatusEnumMapper,
} from './enums/notification-status.enum';
import {
  RecipientTypeEnum,
  RecipientTypeEnumMapper,
} from './enums/recipient-type.enum';

@Entity('notification_logs')
@Index(['labId', 'createdAt'])
@Index(['labId', 'status'])
@Index(['labId', 'destination'])
export class NotificationLog extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({
    type: 'smallint',
    name: 'recipient_type',
    transformer: createEnumTransformer(
      RecipientTypeEnumMapper,
      RecipientTypeEnum,
    ),
    default: 0,
  })
  recipientType: RecipientTypeEnum;

  @Column({ type: 'text', name: 'recipient_name' })
  recipientName: string;

  @Column({ type: 'varchar', length: 255 })
  destination: string;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(
      NotificationChannelEnumMapper,
      NotificationChannelEnum,
    ),
    default: 0,
  })
  channel: NotificationChannelEnum;

  @Column({
    type: 'smallint',
    name: 'notification_type',
    transformer: createEnumTransformer(
      NotificationTypeEnumMapper,
      NotificationTypeEnum,
    ),
    default: 0,
  })
  notificationType: NotificationTypeEnum;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(
      NotificationStatusEnumMapper,
      NotificationStatusEnum,
    ),
    default: 0,
  })
  status: NotificationStatusEnum;

  @Column({ type: 'text', name: 'message_content' })
  messageContent: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @Column({ type: 'varchar', length: 50, default: 'mock' })
  provider: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'provider_message_id',
    nullable: true,
  })
  providerMessageId: string | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'sent_at',
    nullable: true,
  })
  sentAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'delivered_at',
    nullable: true,
  })
  deliveredAt: Date | null;

  @Column({ type: 'text', name: 'failure_reason', nullable: true })
  failureReason: string | null;
}
