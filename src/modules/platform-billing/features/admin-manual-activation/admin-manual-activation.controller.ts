import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminManualActivationHandler, AdminManualActivationResult } from './admin-manual-activation.handler';
import { AdminManualActivationDto } from './admin-manual-activation.dto';
import { AdminManualActivationCommand } from './admin-manual-activation.command';

@Controller('billing/admin')
@UseGuards(SuperAdminGuard)
export class AdminManualActivationController {
  constructor(private readonly handler: AdminManualActivationHandler) {}

  @Post('manual-activation')
  async manualActivation(
    @Body() dto: AdminManualActivationDto,
    @Req() req: any,
  ): Promise<AdminManualActivationResult> {
    const adminEmail = req.user?.email || 'admin@pathiq.in';
    return this.handler.execute(new AdminManualActivationCommand(dto, adminEmail));
  }
}
