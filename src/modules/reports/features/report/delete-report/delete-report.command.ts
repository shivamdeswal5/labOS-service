export class DeleteReportCommand {
  constructor(
    public readonly reportId: string,
    public readonly labId: string,
  ) {}
}
