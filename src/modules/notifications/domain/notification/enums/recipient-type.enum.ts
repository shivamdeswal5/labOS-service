export enum RecipientTypeEnum {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  STAFF = 'STAFF',
}

export const RecipientTypeEnumMapper: Record<RecipientTypeEnum, number> = {
  [RecipientTypeEnum.PATIENT]: 0,
  [RecipientTypeEnum.DOCTOR]: 1,
  [RecipientTypeEnum.STAFF]: 2,
};
