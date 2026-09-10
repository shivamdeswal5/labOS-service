import { Inject, Injectable } from '@nestjs/common';
import { GetFinancialSummaryQuery } from './get-financial-summary.query';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY_TOKEN,
  IFinancialSummary,
} from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';

@Injectable()
export class GetFinancialSummaryHandler {
  constructor(
    @Inject(EXPENSE_REPOSITORY_TOKEN)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(query: GetFinancialSummaryQuery): Promise<IFinancialSummary> {
    const { labId, startDate, endDate } = query;
    return this.expenseRepository.getFinancialSummary(labId, startDate, endDate);
  }
}
