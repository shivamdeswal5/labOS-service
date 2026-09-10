import { NormalRangeTypeEnum } from '../enums/normal-range-type.enum';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';

export interface GenderRange {
  min: number;
  max: number;
}

export interface StructuredNormalRange {
  type: NormalRangeTypeEnum;
  min?: number;
  max?: number;
  male?: GenderRange;
  female?: GenderRange;
  text?: string;
}

export class NormalRange {
  static isOutOfRange(
    normalRange: StructuredNormalRange | null | undefined,
    value: string,
    patientSex?: SexEnum,
  ): boolean {
    if (!normalRange || !value) {
      return false;
    }

    const trimmed = value.trim();

    if (normalRange.type === NormalRangeTypeEnum.NUMERIC) {
      const num = parseFloat(trimmed);
      if (isNaN(num)) return false;

      if (normalRange.min !== undefined && num < normalRange.min) {
        return true;
      }
      if (normalRange.max !== undefined && num > normalRange.max) {
        return true;
      }
      return false;
    }

    if (normalRange.type === NormalRangeTypeEnum.GENDER_SPECIFIC) {
      const num = parseFloat(trimmed);
      if (isNaN(num)) return false;

      const range =
        patientSex === SexEnum.FEMALE
          ? normalRange.female
          : patientSex === SexEnum.MALE
            ? normalRange.male
            : undefined;

      if (!range) return false;

      if (range.min !== undefined && num < range.min) {
        return true;
      }
      if (range.max !== undefined && num > range.max) {
        return true;
      }
      return false;
    }

    if (normalRange.type === NormalRangeTypeEnum.TEXT) {
      if (normalRange.text && trimmed.toLowerCase() !== normalRange.text.toLowerCase()) {
        return true;
      }
      return false;
    }

    return false;
  }
}
