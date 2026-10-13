import { AdminToggleTenantStatusDto } from './admin-toggle-tenant-status.dto';

export class AdminToggleTenantStatusCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: AdminToggleTenantStatusDto,
    public readonly adminEmail: string,
  ) {}
}
