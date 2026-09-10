export enum ReportStatusEnum {
  DRAFT = 'DRAFT',
  FINALIZED = 'FINALIZED',
}

export const ReportStatusEnumMapper: Record<ReportStatusEnum, number> = {
  [ReportStatusEnum.DRAFT]: 0,
  [ReportStatusEnum.FINALIZED]: 1,
};
