import { ExpenseCategoryEnum } from 'src/modules/billing/domain/expense/enums/expense-category.enum';

export class ListExpensesQuery {
  constructor(
    public readonly labId: string,
    public readonly category?: ExpenseCategoryEnum,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) {}
}
