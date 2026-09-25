import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from '../constants/metadata.constants';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      METADATA_KEYS.IS_PUBLIC,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const supabaseUser = await this.supabaseService.getUserFromToken(token);

    if (!supabaseUser) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    const profile = await this.profileRepository.findById(supabaseUser.id);

    request.user = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      profile: profile || null,
      labId: profile?.labId || null,
    };

    return true;
  }
}
