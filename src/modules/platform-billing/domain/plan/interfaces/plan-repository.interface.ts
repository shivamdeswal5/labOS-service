import { PlatformPlan } from '../../entities/platform-plan.entity';
import { PlanSlugEnum } from '../../enums/platform-billing.enums';

export interface IPlanRepository {
  findPublicPlans(): Promise<PlatformPlan[]>;
  findBySlug(slug: PlanSlugEnum): Promise<PlatformPlan | null>;
  findById(id: string): Promise<PlatformPlan | null>;
  save(plan: PlatformPlan): Promise<PlatformPlan>;
}

export const PLAN_REPOSITORY_TOKEN = Symbol('IPlanRepository');
