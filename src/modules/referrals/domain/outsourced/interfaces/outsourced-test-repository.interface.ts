import { OutsourcedTest } from '../outsourced-test.entity';
import { OutsourcedTestStatusEnum } from '../enums/outsourced-test-status.enum';

export const OUTSOURCED_TEST_REPOSITORY_TOKEN = Symbol('IOutsourcedTestRepository');

export interface IOutsourcedTestRepository {
  findById(id: string, labId: string): Promise<OutsourcedTest | null>;
  findByReportId(labId: string, reportId: string): Promise<OutsourcedTest[]>;
  findByLabId(
    labId: string,
    status?: OutsourcedTestStatusEnum,
  ): Promise<OutsourcedTest[]>;
  save(test: OutsourcedTest): Promise<OutsourcedTest>;
  create(data: Partial<OutsourcedTest>): Promise<OutsourcedTest>;
  softDelete(id: string, labId: string): Promise<boolean>;
}
