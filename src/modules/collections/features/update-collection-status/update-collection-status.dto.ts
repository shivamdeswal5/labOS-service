import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CollectionStatusEnum } from '../../domain/collection/enums/collection-status.enum';
import { TubeTypeEnum } from '../../domain/collection/enums/tube-type.enum';

export class CollectionSampleItemDto {
  @IsEnum(TubeTypeEnum)
  tubeType: TubeTypeEnum;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCollectionStatusDto {
  @IsEnum(CollectionStatusEnum)
  status: CollectionStatusEnum;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionSampleItemDto)
  samples?: CollectionSampleItemDto[];

  @IsOptional()
  @IsUUID()
  reportId?: string;
}
