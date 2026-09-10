import { CreateExpenseDto } from './create-expense.dto';

export class CreateExpenseCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreateExpenseDto,
  ) {}
}
