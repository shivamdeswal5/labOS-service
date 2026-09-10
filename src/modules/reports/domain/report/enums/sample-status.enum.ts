export enum SampleStatusEnum {
  COLLECTED = 'COLLECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export const SampleStatusEnumMapper: Record<SampleStatusEnum, number> = {
  [SampleStatusEnum.COLLECTED]: 0,
  [SampleStatusEnum.PROCESSING]: 1,
  [SampleStatusEnum.COMPLETED]: 2,
  [SampleStatusEnum.REJECTED]: 3,
};
