import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import { InvoiceItem } from 'src/modules/billing/domain/invoice/invoice-item.entity';
import { Expense } from 'src/modules/billing/domain/expense/expense.entity';
import { INVOICE_REPOSITORY_TOKEN } from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import { EXPENSE_REPOSITORY_TOKEN } from 'src/modules/billing/domain/expense/interfaces/expense-repository.interface';
import { InvoiceRepository } from './repositories/invoice.repository';
import { ExpenseRepository } from './repositories/expense.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Expense,
    ]),
  ],
  providers: [
    {
      provide: INVOICE_REPOSITORY_TOKEN,
      useClass: InvoiceRepository,
    },
    {
      provide: EXPENSE_REPOSITORY_TOKEN,
      useClass: ExpenseRepository,
    },
  ],
  exports: [INVOICE_REPOSITORY_TOKEN, EXPENSE_REPOSITORY_TOKEN],
})
export class BillingDatabaseModule {}
