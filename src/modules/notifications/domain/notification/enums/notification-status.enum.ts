export enum NotificationStatusEnum {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export const NotificationStatusEnumMapper: Record<NotificationStatusEnum, number> = {
  [NotificationStatusEnum.PENDING]: 0,
  [NotificationStatusEnum.SENT]: 1,
  [NotificationStatusEnum.DELIVERED]: 2,
  [NotificationStatusEnum.FAILED]: 3,
};
