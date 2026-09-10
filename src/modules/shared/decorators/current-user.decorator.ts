import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  profile: Profile;
  labId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
