export class GetReportPdfQuery {
  constructor(
    public readonly labId: string,
    public readonly reportId: string,
  ) {}
}
