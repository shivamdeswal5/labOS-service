import { Controller, Post, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateExpenseHandler } from './create-expense.handler';
import { CreateExpenseCommand } from './create-expense.command';
import { CreateExpenseDto } from './create-expense.dto';

@Controller('expenses')
export class CreateExpenseController {
  constructor(private readonly handler: CreateExpenseHandler) { }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.handler.execute(new CreateExpenseCommand(user.labId, dto));
  }
}
