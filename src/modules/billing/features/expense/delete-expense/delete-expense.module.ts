import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { DeleteExpenseController } from './delete-expense.controller';
import { DeleteExpenseHandler } from './delete-expense.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [DeleteExpenseController],
  providers: [DeleteExpenseHandler],
  exports: [DeleteExpenseHandler],
})
export class DeleteExpenseModule {}
