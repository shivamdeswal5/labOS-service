import { Inject, Injectable } from '@nestjs/common';
import { UpdateOutsourcedStatusCommand } from './update-outsourced-status.command';
import { OutsourcedTest } from 'src/modules/referrals/domain/outsourced/outsourced-test.entity';
import {
  IOutsourcedTestRepository,
  OUTSOURCED_TEST_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/outsourced/interfaces/outsourced-test-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { OutsourcedTestStatusEnum } from 'src/modules/referrals/domain/outsourced/enums/outsourced-test-status.enum';

@Injectable()
export class UpdateOutsourcedStatusHandler {
  constructor(
    @Inject(OUTSOURCED_TEST_REPOSITORY_TOKEN)
    private readonly outsourcedRepository: IOutsourcedTestRepository,
  ) {}

  async execute(command: UpdateOutsourcedStatusCommand): Promise<OutsourcedTest> {
    const { testId, labId, dto } = command;

    const test = await this.outsourcedRepository.findById(testId, labId);
    if (!test) {
      throw new EntityNotFoundException('OutsourcedTest', testId);
    }

    test.status = dto.status;
    if (dto.cost !== undefined) test.cost = dto.cost;
    if (dto.notes !== undefined) test.notes = dto.notes;

    if (dto.status === OutsourcedTestStatusEnum.SENT && !test.sentAt) {
      test.sentAt = new Date();
    } else if (dto.status === OutsourcedTestStatusEnum.RECEIVED && !test.receivedAt) {
      test.receivedAt = new Date();
    }

    return this.outsourcedRepository.save(test);
  }
}
