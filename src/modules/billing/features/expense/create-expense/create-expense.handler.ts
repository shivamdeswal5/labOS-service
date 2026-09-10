import { Inject, Injectable } from '@nestjs/common';
import { CreateExpenseCommand } from './create-expense.command';
import { Expense } from 'src/modules/billing/domain/expense/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';

@Injectable()
export class CreateExpenseHandler {
  constructor(
    @Inject(EXPENSE_REPOSITORY_TOKEN)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    const { labId, dto } = command;

    return this.expenseRepository.create({
      labId,
      category: dto.category,
      title: dto.title,
      amount: dto.amount,
      expenseDate: new Date(dto.expenseDate),
      paymentMethod: dto.paymentMethod,
      vendor: dto.vendor ?? null,
      vendorInvoiceNumber: dto.vendorInvoiceNumber ?? null,
      notes: dto.notes ?? null,
    });
  }
}
