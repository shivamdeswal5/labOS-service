export class GetExpenseQuery {
  constructor(
    public readonly expenseId: string,
    public readonly labId: string,
  ) {}
}
