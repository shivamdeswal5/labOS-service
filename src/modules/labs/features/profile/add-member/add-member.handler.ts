import { Inject, Injectable } from '@nestjs/common';
import { AddMemberCommand } from './add-member.command';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';
import { EntityConflictException } from 'src/modules/shared/domain/exceptions/entity-conflict.exception';

@Injectable()
export class AddMemberHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(command: AddMemberCommand): Promise<Profile> {
    const { labId, dto } = command;

    const existing = await this.profileRepository.findById(dto.userId);
    if (existing) {
      throw new EntityConflictException('User already belongs to a laboratory');
    }

    const profile = this.profileRepository.create({
      id: dto.userId,
      labId,
      fullName: dto.fullName,
      role: dto.role,
      qualification: dto.qualification ?? null,
    });

    return this.profileRepository.save(profile);
  }
}
