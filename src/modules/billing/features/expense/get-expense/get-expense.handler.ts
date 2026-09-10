import { Inject, Injectable } from '@nestjs/common';
import { GetExpenseQuery } from './get-expense.query';
import { Expense } from 'src/modules/billing/domain/expense/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetExpenseHandler {
  constructor(
    @Inject(EXPENSE_REPOSITORY_TOKEN)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(query: GetExpenseQuery): Promise<Expense> {
    const { expenseId, labId } = query;

    const expense = await this.expenseRepository.findById(expenseId, labId);
    if (!expense) {
      throw new EntityNotFoundException('Expense', expenseId);
    }

    return expense;
  }
}
