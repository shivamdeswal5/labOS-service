import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminGetTenantsHandler } from './admin-get-tenants.handler';
import { AdminGetTenantsQuery } from './admin-get-tenants.query';
import { AdminTenantListItemDto } from './admin-tenant-list-item.dto';

@Controller('billing/admin')
@UseGuards(SuperAdminGuard)
export class AdminGetTenantsController {
  constructor(private readonly handler: AdminGetTenantsHandler) {}

  @Get('tenants')
  async getTenants(): Promise<AdminTenantListItemDto[]> {
    return this.handler.execute(new AdminGetTenantsQuery());
  }
}
