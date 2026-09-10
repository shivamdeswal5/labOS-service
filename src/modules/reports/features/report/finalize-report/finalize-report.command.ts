export class FinalizeReportCommand {
  constructor(
    public readonly reportId: string,
    public readonly labId: string,
    public readonly finalizedByUserId: string,
  ) {}
}
