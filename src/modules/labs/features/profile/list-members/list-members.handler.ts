import { Inject, Injectable } from '@nestjs/common';
import { ListMembersQuery } from './list-members.query';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';

@Injectable()
export class ListMembersHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(query: ListMembersQuery): Promise<Profile[]> {
    if (!query.labId) {
      return [];
    }
    return this.profileRepository.findByLabId(query.labId);
  }
}
