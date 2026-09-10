import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { ListExpensesController } from './list-expenses.controller';
import { ListExpensesHandler } from './list-expenses.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [ListExpensesController],
  providers: [ListExpensesHandler],
  exports: [ListExpensesHandler],
})
export class ListExpensesModule {}
