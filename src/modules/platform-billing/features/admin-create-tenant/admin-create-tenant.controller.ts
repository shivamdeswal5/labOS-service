import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminCreateTenantHandler, AdminCreateTenantResult } from './admin-create-tenant.handler';
import { AdminCreateTenantDto } from './admin-create-tenant.dto';
import { AdminCreateTenantCommand } from './admin-create-tenant.command';

@Controller('billing/admin')
@UseGuards(SuperAdminGuard)
export class AdminCreateTenantController {
  constructor(private readonly handler: AdminCreateTenantHandler) {}

  @Post('tenants')
  async createTenant(
    @Body() dto: AdminCreateTenantDto,
    @Req() req: any,
  ): Promise<AdminCreateTenantResult> {
    const adminEmail = req.user?.email || 'admin@pathiq.in';
    return this.handler.execute(new AdminCreateTenantCommand(dto, adminEmail));
  }
}
