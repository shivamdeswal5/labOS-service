export enum ParameterInputTypeEnum {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN',
  GRID = 'GRID',
}

export const ParameterInputTypeEnumMapper: Record<ParameterInputTypeEnum, number> = {
  [ParameterInputTypeEnum.TEXT]: 0,
  [ParameterInputTypeEnum.NUMBER]: 1,
  [ParameterInputTypeEnum.DROPDOWN]: 2,
  [ParameterInputTypeEnum.GRID]: 3,
};
