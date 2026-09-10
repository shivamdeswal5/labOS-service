import { Inject, Injectable } from '@nestjs/common';
import { DeleteExpenseCommand } from './delete-expense.command';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class DeleteExpenseHandler {
  constructor(
    @Inject(EXPENSE_REPOSITORY_TOKEN)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(command: DeleteExpenseCommand): Promise<boolean> {
    const { expenseId, labId } = command;

    const expense = await this.expenseRepository.findById(expenseId, labId);
    if (!expense) {
      throw new EntityNotFoundException('Expense', expenseId);
    }

    return this.expenseRepository.softDelete(expenseId, labId);
  }
}
