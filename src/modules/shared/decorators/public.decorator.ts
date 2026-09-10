import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants/metadata.constants';

export const IS_PUBLIC_KEY = METADATA_KEYS.IS_PUBLIC;
export const Public = () => SetMetadata(METADATA_KEYS.IS_PUBLIC, true);
