import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminExtendTrialHandler, AdminExtendTrialResult } from './admin-extend-trial.handler';
import { AdminExtendTrialDto } from './admin-extend-trial.dto';
import { AdminExtendTrialCommand } from './admin-extend-trial.command';

@Controller('billing/admin/tenants')
@UseGuards(SuperAdminGuard)
export class AdminExtendTrialController {
  constructor(private readonly handler: AdminExtendTrialHandler) {}

  @Post(':id/extend-trial')
  async extendTrial(
    @Param('id') labId: string,
    @Body() dto: AdminExtendTrialDto,
    @Req() req: any,
  ): Promise<AdminExtendTrialResult> {
    const adminEmail = req.user?.email || 'admin@pathiq.in';
    return this.handler.execute(new AdminExtendTrialCommand(labId, dto, adminEmail));
  }
}
