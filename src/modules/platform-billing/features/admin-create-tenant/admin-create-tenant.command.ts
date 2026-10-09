import { AdminCreateTenantDto } from './admin-create-tenant.dto';

export class AdminCreateTenantCommand {
  constructor(
    public readonly dto: AdminCreateTenantDto,
    public readonly adminEmail: string,
  ) {}
}
