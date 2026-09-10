import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetExpenseHandler } from './get-expense.handler';
import { GetExpenseQuery } from './get-expense.query';

@Controller('billing/expenses')
@UseGuards(AuthGuard)
export class GetExpenseController {
  constructor(private readonly handler: GetExpenseHandler) {}

  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.handler.execute(new GetExpenseQuery(id, user.labId));
  }
}
