import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminToggleTenantStatusHandler, AdminToggleTenantStatusResult } from './admin-toggle-tenant-status.handler';
import { AdminToggleTenantStatusDto } from './admin-toggle-tenant-status.dto';
import { AdminToggleTenantStatusCommand } from './admin-toggle-tenant-status.command';

@Controller('billing/admin/tenants')
@UseGuards(SuperAdminGuard)
export class AdminToggleTenantStatusController {
  constructor(private readonly handler: AdminToggleTenantStatusHandler) {}

  @Patch(':id/status')
  async toggleStatus(
    @Param('id') labId: string,
    @Body() dto: AdminToggleTenantStatusDto,
    @Req() req: any,
  ): Promise<AdminToggleTenantStatusResult> {
    const adminEmail = req.user?.email || 'admin@pathiq.in';
    return this.handler.execute(new AdminToggleTenantStatusCommand(labId, dto, adminEmail));
  }
}
