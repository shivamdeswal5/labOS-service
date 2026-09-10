import { Inject, Injectable } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class UpdateProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<Profile> {
    const { userId, dto } = command;

    const profile = await this.profileRepository.findById(userId);
    if (!profile) {
      throw new EntityNotFoundException('Profile', userId);
    }

    if (dto.fullName !== undefined) profile.fullName = dto.fullName;
    if (dto.qualification !== undefined) profile.qualification = dto.qualification;
    if (dto.signatureUrl !== undefined) profile.signatureUrl = dto.signatureUrl;

    return this.profileRepository.save(profile);
  }
}
