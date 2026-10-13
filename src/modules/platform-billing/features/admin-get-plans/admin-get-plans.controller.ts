import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminGetPlansHandler } from './admin-get-plans.handler';
import { AdminGetPlansQuery } from './admin-get-plans.query';
import { PlatformPlan } from '../../domain/entities/platform-plan.entity';

@Controller('billing/admin/plans')
@UseGuards(SuperAdminGuard)
export class AdminGetPlansController {
  constructor(private readonly handler: AdminGetPlansHandler) {}

  @Get()
  async getPlans(): Promise<PlatformPlan[]> {
    return this.handler.execute(new AdminGetPlansQuery());
  }
}
