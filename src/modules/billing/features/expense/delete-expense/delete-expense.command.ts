export class DeleteExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly labId: string,
  ) {}
}
