export class AdminPurgeTestDataCommand {
  constructor(
    public readonly labId: string,
    public readonly adminEmail: string,
  ) {}
}
