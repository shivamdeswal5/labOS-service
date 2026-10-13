import { Inject, Injectable } from '@nestjs/common';
import { AdminGetPlansQuery } from './admin-get-plans.query';
import { PlatformPlan } from '../../domain/entities/platform-plan.entity';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';

@Injectable()
export class AdminGetPlansHandler {
  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
  ) {}

  async execute(_query: AdminGetPlansQuery): Promise<PlatformPlan[]> {
    return this.planRepo.findAll();
  }
}
