import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { CreateExpenseController } from './create-expense.controller';
import { CreateExpenseHandler } from './create-expense.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [CreateExpenseController],
  providers: [CreateExpenseHandler],
  exports: [CreateExpenseHandler],
})
export class CreateExpenseModule {}
