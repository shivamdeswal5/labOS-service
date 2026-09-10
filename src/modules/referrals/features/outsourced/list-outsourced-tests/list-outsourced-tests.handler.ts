import { Inject, Injectable } from '@nestjs/common';
import { ListOutsourcedTestsQuery } from './list-outsourced-tests.query';
import { OutsourcedTest } from 'src/modules/referrals/domain/outsourced/outsourced-test.entity';
import {
  IOutsourcedTestRepository,
  OUTSOURCED_TEST_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/outsourced/interfaces/outsourced-test-repository.interface';

@Injectable()
export class ListOutsourcedTestsHandler {
  constructor(
    @Inject(OUTSOURCED_TEST_REPOSITORY_TOKEN)
    private readonly outsourcedRepository: IOutsourcedTestRepository,
  ) {}

  async execute(query: ListOutsourcedTestsQuery): Promise<OutsourcedTest[]> {
    const { labId, status, reportId } = query;

    if (reportId) {
      return this.outsourcedRepository.findByReportId(labId, reportId);
    }

    return this.outsourcedRepository.findByLabId(labId, status);
  }
}
