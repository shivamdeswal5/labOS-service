export enum CollectionStatusEnum {
  REQUESTED = 'REQUESTED',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  SAMPLE_COLLECTED = 'SAMPLE_COLLECTED',
  DELIVERED_TO_LAB = 'DELIVERED_TO_LAB',
  CANCELLED = 'CANCELLED',
}

export const CollectionStatusEnumMapper: Record<CollectionStatusEnum, number> = {
  [CollectionStatusEnum.REQUESTED]: 0,
  [CollectionStatusEnum.ASSIGNED]: 1,
  [CollectionStatusEnum.IN_TRANSIT]: 2,
  [CollectionStatusEnum.SAMPLE_COLLECTED]: 3,
  [CollectionStatusEnum.DELIVERED_TO_LAB]: 4,
  [CollectionStatusEnum.CANCELLED]: 5,
};
