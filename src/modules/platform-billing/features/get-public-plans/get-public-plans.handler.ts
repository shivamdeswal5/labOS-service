import { Inject, Injectable } from '@nestjs/common';
import { GetPublicPlansQuery } from './get-public-plans.query';
import { PlatformPlan } from '../../domain/entities/platform-plan.entity';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';

@Injectable()
export class GetPublicPlansHandler {
  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
  ) {}

  async execute(_query: GetPublicPlansQuery): Promise<PlatformPlan[]> {
    return this.planRepo.findPublicPlans();
  }
}
