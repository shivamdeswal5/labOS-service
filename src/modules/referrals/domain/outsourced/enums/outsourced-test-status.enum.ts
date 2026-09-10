export enum OutsourcedTestStatusEnum {
  PENDING = 'PENDING',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export const OutsourcedTestStatusEnumMapper: Record<OutsourcedTestStatusEnum, number> = {
  [OutsourcedTestStatusEnum.PENDING]: 0,
  [OutsourcedTestStatusEnum.SENT]: 1,
  [OutsourcedTestStatusEnum.RECEIVED]: 2,
  [OutsourcedTestStatusEnum.CANCELLED]: 3,
};
