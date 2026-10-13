import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminUpdatePlanHandler } from './admin-update-plan.handler';
import { AdminUpdatePlanDto } from './admin-update-plan.dto';
import { AdminUpdatePlanCommand } from './admin-update-plan.command';
import { PlatformPlan } from '../../domain/entities/platform-plan.entity';

@Controller('billing/admin/plans')
@UseGuards(SuperAdminGuard)
export class AdminUpdatePlanController {
  constructor(private readonly handler: AdminUpdatePlanHandler) {}

  @Patch(':id')
  async updatePlan(
    @Param('id') planId: string,
    @Body() dto: AdminUpdatePlanDto,
    @Req() req: any,
  ): Promise<PlatformPlan> {
    const adminEmail = req.user?.email || 'admin@pathiq.in';
    return this.handler.execute(new AdminUpdatePlanCommand(planId, dto, adminEmail));
  }
}
