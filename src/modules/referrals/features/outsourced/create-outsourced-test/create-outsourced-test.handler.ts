import { Inject, Injectable } from '@nestjs/common';
import { CreateOutsourcedTestCommand } from './create-outsourced-test.command';
import { OutsourcedTest } from 'src/modules/referrals/domain/outsourced/outsourced-test.entity';
import {
  IOutsourcedTestRepository,
  OUTSOURCED_TEST_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/outsourced/interfaces/outsourced-test-repository.interface';
import { OutsourcedTestStatusEnum } from 'src/modules/referrals/domain/outsourced/enums/outsourced-test-status.enum';

@Injectable()
export class CreateOutsourcedTestHandler {
  constructor(
    @Inject(OUTSOURCED_TEST_REPOSITORY_TOKEN)
    private readonly outsourcedRepository: IOutsourcedTestRepository,
  ) {}

  async execute(command: CreateOutsourcedTestCommand): Promise<OutsourcedTest> {
    const { labId, dto } = command;

    return this.outsourcedRepository.create({
      labId,
      reportId: dto.reportId,
      testName: dto.testName,
      referenceLabName: dto.referenceLabName,
      status: OutsourcedTestStatusEnum.PENDING,
      cost: dto.cost ?? null,
      notes: dto.notes ?? null,
    });
  }
}
