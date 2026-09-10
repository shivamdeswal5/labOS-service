export enum ExpenseCategoryEnum {
  REAGENTS = 'REAGENTS',
  CONSUMABLES = 'CONSUMABLES',
  EQUIPMENT = 'EQUIPMENT',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  SALARIES = 'SALARIES',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

export const ExpenseCategoryEnumMapper: Record<ExpenseCategoryEnum, number> = {
  [ExpenseCategoryEnum.REAGENTS]: 0,
  [ExpenseCategoryEnum.CONSUMABLES]: 1,
  [ExpenseCategoryEnum.EQUIPMENT]: 2,
  [ExpenseCategoryEnum.RENT]: 3,
  [ExpenseCategoryEnum.UTILITIES]: 4,
  [ExpenseCategoryEnum.SALARIES]: 5,
  [ExpenseCategoryEnum.MAINTENANCE]: 6,
  [ExpenseCategoryEnum.OTHER]: 7,
};
