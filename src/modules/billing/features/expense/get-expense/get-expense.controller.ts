import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetExpenseHandler } from './get-expense.handler';
import { GetExpenseQuery } from './get-expense.query';

@Controller('expenses')
export class GetExpenseController {
  constructor(private readonly handler: GetExpenseHandler) { }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.handler.execute(new GetExpenseQuery(id, user.labId));
  }
}
