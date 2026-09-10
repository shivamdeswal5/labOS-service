export class GetReportQuery {
  constructor(
    public readonly reportId: string,
    public readonly labId: string,
  ) {}
}
