import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { UpdateExpenseController } from './update-expense.controller';
import { UpdateExpenseHandler } from './update-expense.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [UpdateExpenseController],
  providers: [UpdateExpenseHandler],
  exports: [UpdateExpenseHandler],
})
export class UpdateExpenseModule {}
