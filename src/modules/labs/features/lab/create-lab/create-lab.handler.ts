import { Inject, Injectable } from '@nestjs/common';
import { CreateLabCommand } from './create-lab.command';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import {
  ILabRepository,
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';
import { EntityConflictException } from 'src/modules/shared/domain/exceptions/entity-conflict.exception';

@Injectable()
export class CreateLabHandler {
  constructor(
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepository: ILabRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(command: CreateLabCommand): Promise<Lab> {
    const { userId, dto } = command;

    const existingProfile = await this.profileRepository.findById(userId);
    if (existingProfile) {
      throw new EntityConflictException('User is already registered with a laboratory');
    }

    return this.labRepository.createLabWithOwner(
      {
        name: dto.name,
        address: dto.address,
        phoneNumbers: dto.phoneNumbers,
        logoUrl: dto.logoUrl ?? null,
        accentColor: dto.accentColor,
        tagline: dto.tagline ?? null,
        footerNote: dto.footerNote ?? 'NOT VALID FOR MEDICO LEGAL PURPOSE',
        reportLanguage: dto.reportLanguage,
      },
      {
        id: userId,
        fullName: dto.ownerFullName,
        role: RoleEnum.OWNER,
      },
    );
  }
}
