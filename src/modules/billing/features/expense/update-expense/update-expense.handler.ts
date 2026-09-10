import { Inject, Injectable } from '@nestjs/common';
import { UpdateExpenseCommand } from './update-expense.command';
import { Expense } from 'src/modules/billing/domain/expense/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class UpdateExpenseHandler {
  constructor(
    @Inject(EXPENSE_REPOSITORY_TOKEN)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(command: UpdateExpenseCommand): Promise<Expense> {
    const { expenseId, labId, dto } = command;

    const expense = await this.expenseRepository.findById(expenseId, labId);
    if (!expense) {
      throw new EntityNotFoundException('Expense', expenseId);
    }

    if (dto.category !== undefined) expense.category = dto.category;
    if (dto.title !== undefined) expense.title = dto.title;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.expenseDate !== undefined) expense.expenseDate = new Date(dto.expenseDate);
    if (dto.paymentMethod !== undefined) expense.paymentMethod = dto.paymentMethod;
    if (dto.vendor !== undefined) expense.vendor = dto.vendor;
    if (dto.vendorInvoiceNumber !== undefined) {
      expense.vendorInvoiceNumber = dto.vendorInvoiceNumber;
    }
    if (dto.notes !== undefined) expense.notes = dto.notes;

    return this.expenseRepository.save(expense);
  }
}
