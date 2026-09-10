import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListExpensesHandler } from './list-expenses.handler';
import { ListExpensesQuery } from './list-expenses.query';
import { ExpenseCategoryEnum } from 'src/modules/billing/domain/expense/enums/expense-category.enum';

@Controller('billing/expenses')
@UseGuards(AuthGuard)
export class ListExpensesController {
  constructor(private readonly handler: ListExpensesHandler) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('category') category?: ExpenseCategoryEnum,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.handler.execute(
      new ListExpensesQuery(user.labId, category, startDate, endDate),
    );
  }
}
