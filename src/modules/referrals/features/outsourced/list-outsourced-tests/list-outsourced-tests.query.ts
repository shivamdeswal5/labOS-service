import { OutsourcedTestStatusEnum } from 'src/modules/referrals/domain/outsourced/enums/outsourced-test-status.enum';

export class ListOutsourcedTestsQuery {
  constructor(
    public readonly labId: string,
    public readonly status?: OutsourcedTestStatusEnum,
    public readonly reportId?: string,
  ) {}
}
