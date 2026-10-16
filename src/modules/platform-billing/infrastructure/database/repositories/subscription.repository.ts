import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSubscription } from '../../../domain/entities/tenant-subscription.entity';
import { ISubscriptionRepository } from '../../../domain/subscription/interfaces/subscription-repository.interface';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @InjectRepository(TenantSubscription)
    private readonly repo: Repository<TenantSubscription>,
  ) {}

  async findByLabId(labId: string): Promise<TenantSubscription | null> {
    return this.repo.findOne({
      where: { labId },
      relations: { plan: true, scheduledPlan: true },
    });
  }

  async findWithLock(labId: string): Promise<TenantSubscription | null> {
    const qb = this.repo
      .createQueryBuilder('sub')
      .where('sub.lab_id = :labId', { labId });

    if (this.repo.manager.queryRunner?.isTransactionActive) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }

  async findAll(): Promise<TenantSubscription[]> {
    return this.repo.find({
      relations: { plan: true, scheduledPlan: true },
      order: { createdAt: 'DESC' },
    });
  }

  async save(subscription: TenantSubscription): Promise<TenantSubscription> {
    return this.repo.save(subscription);
  }

  create(data: Partial<TenantSubscription>): TenantSubscription {
    return this.repo.create(data);
  }
}
