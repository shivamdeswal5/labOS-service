import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateExpenseHandler } from './create-expense.handler';
import { CreateExpenseCommand } from './create-expense.command';
import { CreateExpenseDto } from './create-expense.dto';

@Controller('billing/expenses')
@UseGuards(AuthGuard)
export class CreateExpenseController {
  constructor(private readonly handler: CreateExpenseHandler) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.handler.execute(new CreateExpenseCommand(user.labId, dto));
  }
}
