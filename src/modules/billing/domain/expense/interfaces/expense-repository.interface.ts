import { Expense } from '../expense.entity';
import { ExpenseCategoryEnum } from '../enums/expense-category.enum';

export const EXPENSE_REPOSITORY_TOKEN = Symbol('IExpenseRepository');

export interface FindExpensesFilter {
  category?: ExpenseCategoryEnum;
  startDate?: string;
  endDate?: string;
}

export interface IFinancialSummary {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  collectionsByMethod: Record<string, number>;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  netCashFlow: number;
}

export interface IExpenseRepository {
  findById(id: string, labId: string): Promise<Expense | null>;
  findByLabId(labId: string, filter?: FindExpensesFilter): Promise<Expense[]>;
  getFinancialSummary(
    labId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IFinancialSummary>;
  save(expense: Expense): Promise<Expense>;
  create(data: Partial<Expense>): Promise<Expense>;
  softDelete(id: string, labId: string): Promise<boolean>;
}
