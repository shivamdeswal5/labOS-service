export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const SexEnumMapper: Record<SexEnum, number> = {
  [SexEnum.MALE]: 0,
  [SexEnum.FEMALE]: 1,
  [SexEnum.OTHER]: 2,
};
