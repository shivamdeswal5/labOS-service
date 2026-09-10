import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionRequest } from 'src/modules/collections/domain/collection/collection-request.entity';
import {
  ICollectionRequestRepository,
  FindCollectionsFilter,
} from 'src/modules/collections/domain/collection/interfaces/collection-request-repository.interface';

@Injectable()
export class CollectionRequestRepository
  implements ICollectionRequestRepository
{
  constructor(
    @InjectRepository(CollectionRequest)
    private readonly repo: Repository<CollectionRequest>,
  ) {}

  async findById(id: string, labId: string): Promise<CollectionRequest | null> {
    return this.repo.findOne({
      where: { id, labId },
      relations: { samples: true },
    });
  }

  async findByLabId(
    labId: string,
    filter?: FindCollectionsFilter,
  ): Promise<CollectionRequest[]> {
    const qb = this.repo
      .createQueryBuilder('cr')
      .leftJoinAndSelect('cr.samples', 'samples')
      .where('cr.lab_id = :labId', { labId })
      .andWhere('cr.deleted_at IS NULL');

    if (filter?.status !== undefined) {
      qb.andWhere('cr.status = :status', { status: filter.status });
    }

    if (filter?.phlebotomistId) {
      qb.andWhere('cr.assigned_phlebotomist_id = :phlebotomistId', {
        phlebotomistId: filter.phlebotomistId,
      });
    }

    if (filter?.preferredDate) {
      qb.andWhere('cr.preferred_date = :preferredDate', {
        preferredDate: filter.preferredDate,
      });
    }

    if (filter?.patientPhone) {
      qb.andWhere('cr.patient_phone LIKE :patientPhone', {
        patientPhone: `%${filter.patientPhone}%`,
      });
    }

    return qb
      .orderBy('cr.preferred_date', 'DESC')
      .addOrderBy('cr.created_at', 'DESC')
      .getMany();
  }

  async save(collection: CollectionRequest): Promise<CollectionRequest> {
    return this.repo.save(collection);
  }

  async create(
    data: Partial<CollectionRequest>,
  ): Promise<CollectionRequest> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async generateRequestNumber(labId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repo
      .createQueryBuilder('cr')
      .where('cr.lab_id = :labId', { labId })
      .getCount();

    return `COL-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async softDelete(id: string, labId: string): Promise<boolean> {
    const result = await this.repo.softDelete({ id, labId });
    return (result.affected ?? 0) > 0;
  }
}
