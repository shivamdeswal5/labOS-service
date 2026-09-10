import { Inject, Injectable } from '@nestjs/common';
import { ListExpensesQuery } from './list-expenses.query';
import { Expense } from 'src/modules/billing/domain/expense/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';

@Injectable()
export class ListExpensesHandler {
  constructor(
    @Inject(EXPENSE_REPOSITORY_TOKEN)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(query: ListExpensesQuery): Promise<Expense[]> {
    const { labId, category, startDate, endDate } = query;

    return this.expenseRepository.findByLabId(labId, {
      category,
      startDate,
      endDate,
    });
  }
}
