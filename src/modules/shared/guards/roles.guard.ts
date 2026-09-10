import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from '../constants/metadata.constants';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(METADATA_KEYS.ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.profile) {
      throw new ForbiddenException('User has no assigned profile or role');
    }

    const userRole = user.profile.role as RoleEnum;
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `User role '${userRole}' is not authorized to perform this action. Required: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
