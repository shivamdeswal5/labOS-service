export enum CommissionStatusEnum {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
}

export const CommissionStatusEnumMapper: Record<CommissionStatusEnum, number> = {
  [CommissionStatusEnum.PENDING]: 0,
  [CommissionStatusEnum.SETTLED]: 1,
};
