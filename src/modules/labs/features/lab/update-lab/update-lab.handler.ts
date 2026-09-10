import { Inject, Injectable } from '@nestjs/common';
import { UpdateLabCommand } from './update-lab.command';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import {
  ILabRepository,
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class UpdateLabHandler {
  constructor(
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepository: ILabRepository,
  ) {}

  async execute(command: UpdateLabCommand): Promise<Lab> {
    const { labId, dto } = command;

    const lab = await this.labRepository.findById(labId);
    if (!lab) {
      throw new EntityNotFoundException('Laboratory', labId);
    }

    if (dto.name !== undefined) lab.name = dto.name;
    if (dto.address !== undefined) lab.address = dto.address;
    if (dto.phoneNumbers !== undefined) lab.phoneNumbers = dto.phoneNumbers;
    if (dto.logoUrl !== undefined) lab.logoUrl = dto.logoUrl;
    if (dto.accentColor !== undefined) lab.accentColor = dto.accentColor;
    if (dto.tagline !== undefined) lab.tagline = dto.tagline;
    if (dto.footerNote !== undefined) lab.footerNote = dto.footerNote;
    if (dto.reportLanguage !== undefined) lab.reportLanguage = dto.reportLanguage;

    return this.labRepository.save(lab);
  }
}
