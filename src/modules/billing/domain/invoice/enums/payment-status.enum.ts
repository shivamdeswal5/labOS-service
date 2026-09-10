export enum PaymentStatusEnum {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export const PaymentStatusEnumMapper: Record<PaymentStatusEnum, number> = {
  [PaymentStatusEnum.UNPAID]: 0,
  [PaymentStatusEnum.PARTIALLY_PAID]: 1,
  [PaymentStatusEnum.PAID]: 2,
  [PaymentStatusEnum.REFUNDED]: 3,
};
