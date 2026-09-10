import { Module } from '@nestjs/common';
import { CreateExpenseModule } from './create-expense/create-expense.module';
import { GetExpenseModule } from './get-expense/get-expense.module';
import { ListExpensesModule } from './list-expenses/list-expenses.module';
import { UpdateExpenseModule } from './update-expense/update-expense.module';
import { DeleteExpenseModule } from './delete-expense/delete-expense.module';

@Module({
  imports: [
    CreateExpenseModule,
    GetExpenseModule,
    ListExpensesModule,
    UpdateExpenseModule,
    DeleteExpenseModule,
  ],
  exports: [
    CreateExpenseModule,
    GetExpenseModule,
    ListExpensesModule,
    UpdateExpenseModule,
    DeleteExpenseModule,
  ],
})
export class ExpenseFeatureModule {}
