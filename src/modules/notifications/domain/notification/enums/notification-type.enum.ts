export enum NotificationTypeEnum {
  REPORT_READY = 'REPORT_READY',
  CRITICAL_ALERT = 'CRITICAL_ALERT',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  CUSTOM = 'CUSTOM',
}

export const NotificationTypeEnumMapper: Record<NotificationTypeEnum, number> = {
  [NotificationTypeEnum.REPORT_READY]: 0,
  [NotificationTypeEnum.CRITICAL_ALERT]: 1,
  [NotificationTypeEnum.PAYMENT_RECEIPT]: 2,
  [NotificationTypeEnum.CUSTOM]: 3,
};
