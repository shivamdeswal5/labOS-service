export enum CommissionTypeEnum {
  NONE = 'NONE',
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE',
}

export const CommissionTypeEnumMapper: Record<CommissionTypeEnum, number> = {
  [CommissionTypeEnum.NONE]: 0,
  [CommissionTypeEnum.FLAT]: 1,
  [CommissionTypeEnum.PERCENTAGE]: 2,
};
