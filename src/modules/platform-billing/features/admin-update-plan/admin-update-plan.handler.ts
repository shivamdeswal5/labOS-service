import { Inject, Injectable, Logger } from '@nestjs/common';
import { AdminUpdatePlanCommand } from './admin-update-plan.command';
import { PlatformPlan } from '../../domain/entities/platform-plan.entity';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';

@Injectable()
export class AdminUpdatePlanHandler {
  private readonly logger = new Logger(AdminUpdatePlanHandler.name);

  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
  ) {}

  async execute(command: AdminUpdatePlanCommand): Promise<PlatformPlan> {
    const { planId, dto, adminEmail } = command;
    const plan = await this.planRepo.findById(planId);

    if (!plan) {
      throw new PlanNotFoundException(planId);
    }

    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.monthlyPriceInr !== undefined) plan.monthlyPriceInr = dto.monthlyPriceInr;
    if (dto.yearlyPriceInr !== undefined) plan.yearlyPriceInr = dto.yearlyPriceInr;
    if (dto.featureEntitlements !== undefined) plan.featureEntitlements = dto.featureEntitlements;
    if (dto.isActive !== undefined) plan.isActive = dto.isActive;
    if (dto.isPublic !== undefined) plan.isPublic = dto.isPublic;

    const saved = await this.planRepo.save(plan);

    this.logger.log(
      `[Admin Plan Updated] Plan: ${plan.slug} (${plan.id}) | Monthly: ₹${plan.monthlyPriceInr} | Yearly: ₹${plan.yearlyPriceInr} | Active: ${plan.isActive} | Admin: ${adminEmail}`,
    );

    return saved;
  }
}
