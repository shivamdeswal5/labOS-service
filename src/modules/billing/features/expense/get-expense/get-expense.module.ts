import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { GetExpenseController } from './get-expense.controller';
import { GetExpenseHandler } from './get-expense.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [GetExpenseController],
  providers: [GetExpenseHandler],
  exports: [GetExpenseHandler],
})
export class GetExpenseModule {}
