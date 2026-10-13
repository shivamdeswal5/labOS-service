import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformPlan } from '../../../domain/entities/platform-plan.entity';
import { IPlanRepository } from '../../../domain/plan/interfaces/plan-repository.interface';
import { PlanSlugEnum } from '../../../domain/enums/platform-billing.enums';

@Injectable()
export class PlanRepository implements IPlanRepository {
  constructor(
    @InjectRepository(PlatformPlan)
    private readonly repo: Repository<PlatformPlan>,
  ) {}

  async findAll(): Promise<PlatformPlan[]> {
    return this.repo.find({
      order: { monthlyPriceInr: 'ASC' },
    });
  }

  async findPublicPlans(): Promise<PlatformPlan[]> {
    return this.repo.find({
      where: { isActive: true, isPublic: true },
      order: { monthlyPriceInr: 'ASC' },
    });
  }

  async findBySlug(slug: PlanSlugEnum): Promise<PlatformPlan | null> {
    return this.repo.findOne({
      where: { slug, isActive: true },
    });
  }

  async findById(id: string): Promise<PlatformPlan | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(plan: PlatformPlan): Promise<PlatformPlan> {
    return this.repo.save(plan);
  }
}
