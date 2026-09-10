export enum PaymentMethodEnum {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
  OTHER = 'OTHER',
}

export const PaymentMethodEnumMapper: Record<PaymentMethodEnum, number> = {
  [PaymentMethodEnum.CASH]: 0,
  [PaymentMethodEnum.UPI]: 1,
  [PaymentMethodEnum.CARD]: 2,
  [PaymentMethodEnum.NET_BANKING]: 3,
  [PaymentMethodEnum.OTHER]: 4,
};
