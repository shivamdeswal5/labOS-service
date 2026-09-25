
export enum RoleEnum {
  OWNER = 'OWNER',
  TECHNICIAN = 'TECHNICIAN',
  PATHOLOGIST = 'PATHOLOGIST',
  PHLEBOTOMIST = 'PHLEBOTOMIST',
}

export const RoleEnumMapper: Record<RoleEnum, number> = {
  [RoleEnum.OWNER]: 0,
  [RoleEnum.TECHNICIAN]: 1,
  [RoleEnum.PATHOLOGIST]: 2,
  [RoleEnum.PHLEBOTOMIST]: 3,
};
