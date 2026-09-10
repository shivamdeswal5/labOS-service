import { ValueTransformer } from 'typeorm';

export class EnumTransformer<T extends string> implements ValueTransformer {
  private readonly reverseMap = new Map<number, T>();

  constructor(
    private readonly mapper: Record<T, number>,
    private readonly enumObject?: object,
  ) {
    for (const [key, numVal] of Object.entries(this.mapper)) {
      this.reverseMap.set(numVal as number, key as T);
    }
  }

  
  to(value: T | null | undefined): number | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }

    const dbVal = this.mapper[value];
    if (dbVal === undefined) {
      throw new Error(`Invalid enum value '${value}' - no integer mapping found`);
    }

    return dbVal;
  }

  
  from(value: number | string | null | undefined): T | null | undefined {
    if (value === null || value === undefined) {
      return value as null | undefined;
    }

    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    const enumVal = this.reverseMap.get(num);

    if (enumVal === undefined) {
      throw new Error(`Invalid database enum integer '${value}' - no reverse enum mapping found`);
    }

    return enumVal;
  }
}

export function createEnumTransformer<T extends string>(
  mapper: Record<T, number>,
  enumObject?: object,
): EnumTransformer<T> {
  return new EnumTransformer<T>(mapper, enumObject);
}
