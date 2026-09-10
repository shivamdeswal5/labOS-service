import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutsourcedTest } from 'src/modules/referrals/domain/outsourced/outsourced-test.entity';
import { IOutsourcedTestRepository } from 'src/modules/referrals/domain/outsourced/interfaces/outsourced-test-repository.interface';
import { OutsourcedTestStatusEnum } from 'src/modules/referrals/domain/outsourced/enums/outsourced-test-status.enum';

@Injectable()
export class OutsourcedTestRepository implements IOutsourcedTestRepository {
  constructor(
    @InjectRepository(OutsourcedTest)
    private readonly testRepo: Repository<OutsourcedTest>,
  ) {}

  async findById(id: string, labId: string): Promise<OutsourcedTest | null> {
    return this.testRepo.findOne({
      where: { id, labId },
    });
  }

  async findByReportId(labId: string, reportId: string): Promise<OutsourcedTest[]> {
    return this.testRepo.find({
      where: { labId, reportId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByLabId(
    labId: string,
    status?: OutsourcedTestStatusEnum,
  ): Promise<OutsourcedTest[]> {
    const query = this.testRepo
      .createQueryBuilder('test')
      .where('test.lab_id = :labId', { labId })
      .andWhere('test.deleted_at IS NULL');

    if (status !== undefined) {
      query.andWhere('test.status = :status', { status });
    }

    return query
      .orderBy('test.created_at', 'DESC')
      .getMany();
  }

  async save(test: OutsourcedTest): Promise<OutsourcedTest> {
    return this.testRepo.save(test);
  }

  async create(data: Partial<OutsourcedTest>): Promise<OutsourcedTest> {
    const test = this.testRepo.create(data);
    return this.testRepo.save(test);
  }

  async softDelete(id: string, labId: string): Promise<boolean> {
    const result = await this.testRepo.softDelete({ id, labId });
    return (result.affected ?? 0) > 0;
  }
}
