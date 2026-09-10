export enum NotificationChannelEnum {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export const NotificationChannelEnumMapper: Record<NotificationChannelEnum, number> = {
  [NotificationChannelEnum.WHATSAPP]: 0,
  [NotificationChannelEnum.SMS]: 1,
  [NotificationChannelEnum.EMAIL]: 2,
};
