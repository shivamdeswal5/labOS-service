import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { METADATA_KEYS } from '../constants/metadata.constants';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

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

    const profile = await this.profileRepository.findOne({
      where: { id: supabaseUser.id },
      relations: { lab: true },
    });

    request.user = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      profile: profile || null,
      labId: profile?.labId || null,
    };

    return true;
  }
}
