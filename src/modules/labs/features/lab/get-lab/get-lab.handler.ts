import { Inject, Injectable } from '@nestjs/common';
import { GetLabQuery } from './get-lab.query';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import {
  ILabRepository,
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetLabHandler {
  constructor(
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepository: ILabRepository,
  ) {}

  async execute(query: GetLabQuery): Promise<Lab> {
    const lab = await this.labRepository.findById(query.labId);
    if (!lab) {
      throw new EntityNotFoundException('Laboratory', query.labId);
    }
    return lab;
  }
}
