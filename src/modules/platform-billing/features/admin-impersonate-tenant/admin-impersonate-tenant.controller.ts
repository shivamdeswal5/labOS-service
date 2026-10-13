import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminImpersonateTenantHandler, AdminImpersonateResult } from './admin-impersonate-tenant.handler';
import { AdminImpersonateTenantCommand } from './admin-impersonate-tenant.command';

@Controller('billing/admin/tenants')
@UseGuards(SuperAdminGuard)
export class AdminImpersonateTenantController {
  constructor(private readonly handler: AdminImpersonateTenantHandler) {}

  @Post(':id/impersonate')
  async impersonate(
    @Param('id') labId: string,
    @Req() req: any,
  ): Promise<AdminImpersonateResult> {
    const adminEmail = req.user?.email || 'admin@pathiq.in';
    return this.handler.execute(new AdminImpersonateTenantCommand(labId, adminEmail));
  }
}
