export class AdminImpersonateTenantCommand {
  constructor(
    public readonly labId: string,
    public readonly adminEmail: string,
  ) {}
}
