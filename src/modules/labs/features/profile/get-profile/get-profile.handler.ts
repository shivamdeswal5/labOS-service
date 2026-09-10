import { Inject, Injectable } from '@nestjs/common';
import { GetProfileQuery } from './get-profile.query';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(query: GetProfileQuery): Promise<Profile> {
    const profile = await this.profileRepository.findById(query.userId);
    if (!profile) {
      throw new EntityNotFoundException('Profile', query.userId);
    }
    return profile;
  }
}
