export class GetFinancialSummaryQuery {
  constructor(
    public readonly labId: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) {}
}
