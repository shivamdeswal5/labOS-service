import { UpdateExpenseDto } from './update-expense.dto';

export class UpdateExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly labId: string,
    public readonly dto: UpdateExpenseDto,
  ) {}
}
