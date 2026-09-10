import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Expense } from 'src/modules/billing/domain/expense/expense.entity';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import {
  IExpenseRepository,
  FindExpensesFilter,
  IFinancialSummary,
} from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';
import { ExpenseCategoryEnum } from 'src/modules/billing/domain/expense/enums/expense-category.enum';
import { PaymentMethodEnum } from 'src/modules/billing/domain/invoice/enums/payment-method.enum';

@Injectable()
export class ExpenseRepository implements IExpenseRepository {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string, labId: string): Promise<Expense | null> {
    return this.expenseRepo.findOne({
      where: { id, labId },
    });
  }

  async findByLabId(
    labId: string,
    filter?: FindExpensesFilter,
  ): Promise<Expense[]> {
    const query = this.expenseRepo
      .createQueryBuilder('expense')
      .where('expense.lab_id = :labId', { labId })
      .andWhere('expense.deleted_at IS NULL');

    if (filter?.category !== undefined) {
      query.andWhere('expense.category = :category', { category: filter.category });
    }

    if (filter?.startDate) {
      query.andWhere('expense.expense_date >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter?.endDate) {
      query.andWhere('expense.expense_date <= :endDate', {
        endDate: filter.endDate,
      });
    }

    return query
      .orderBy('expense.expense_date', 'DESC')
      .addOrderBy('expense.created_at', 'DESC')
      .getMany();
  }

  async getFinancialSummary(
    labId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IFinancialSummary> {
    const invoiceQuery = this.dataSource
      .getRepository(Invoice)
      .createQueryBuilder('inv')
      .where('inv.lab_id = :labId', { labId })
      .andWhere('inv.deleted_at IS NULL');

    const expenseQuery = this.expenseRepo
      .createQueryBuilder('exp')
      .where('exp.lab_id = :labId', { labId })
      .andWhere('exp.deleted_at IS NULL');

    if (startDate) {
      invoiceQuery.andWhere('inv.created_at >= :startDate', { startDate });
      expenseQuery.andWhere('exp.expense_date >= :startDate', { startDate });
    }

    if (endDate) {
      invoiceQuery.andWhere('inv.created_at <= :endDate', { endDate });
      expenseQuery.andWhere('exp.expense_date <= :endDate', { endDate });
    }

    const [invoiceTotals, collectionsByMethodRaw, expenseTotals, expensesByCategoryRaw] =
      await Promise.all([
        invoiceQuery
          .clone()
          .select([
            'COALESCE(SUM(inv.total_amount), 0) AS "totalRevenue"',
            'COALESCE(SUM(inv.paid_amount), 0) AS "totalPaid"',
          ])
          .getRawOne(),
        invoiceQuery
          .clone()
          .select([
            'inv.payment_method AS "method"',
            'COALESCE(SUM(inv.paid_amount), 0) AS "amount"',
          ])
          .andWhere('inv.payment_method IS NOT NULL')
          .groupBy('inv.payment_method')
          .getRawMany(),
        expenseQuery
          .clone()
          .select(['COALESCE(SUM(exp.amount), 0) AS "totalExpenses"'])
          .getRawOne(),
        expenseQuery
          .clone()
          .select([
            'exp.category AS "category"',
            'COALESCE(SUM(exp.amount), 0) AS "amount"',
          ])
          .groupBy('exp.category')
          .getRawMany(),
      ]);

    const totalRevenue = parseFloat(invoiceTotals?.totalRevenue || '0');
    const totalPaid = parseFloat(invoiceTotals?.totalPaid || '0');
    const totalExpenses = parseFloat(expenseTotals?.totalExpenses || '0');
    const totalPending = Math.max(0, totalRevenue - totalPaid);
    const netCashFlow = totalPaid - totalExpenses;

    const collectionsByMethod: Record<string, number> = {};
    for (const row of collectionsByMethodRaw) {
      const methodName =
        Object.keys(PaymentMethodEnum)[row.method] ?? `METHOD_${row.method}`;
      collectionsByMethod[methodName] = parseFloat(row.amount || '0');
    }

    const expensesByCategory: Record<string, number> = {};
    for (const row of expensesByCategoryRaw) {
      const catName =
        Object.keys(ExpenseCategoryEnum)[row.category] ?? `CAT_${row.category}`;
      expensesByCategory[catName] = parseFloat(row.amount || '0');
    }

    return {
      totalRevenue,
      totalPaid,
      totalPending,
      collectionsByMethod,
      totalExpenses,
      expensesByCategory,
      netCashFlow,
    };
  }

  async save(expense: Expense): Promise<Expense> {
    return this.expenseRepo.save(expense);
  }

  async create(data: Partial<Expense>): Promise<Expense> {
    const expense = this.expenseRepo.create(data);
    return this.expenseRepo.save(expense);
  }

  async softDelete(id: string, labId: string): Promise<boolean> {
    const result = await this.expenseRepo.softDelete({ id, labId });
    return (result.affected ?? 0) > 0;
  }
}
