import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants/metadata.constants';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';

export const ROLES_KEY = METADATA_KEYS.ROLES;
export const Roles = (...roles: RoleEnum[]) => SetMetadata(METADATA_KEYS.ROLES, roles);
