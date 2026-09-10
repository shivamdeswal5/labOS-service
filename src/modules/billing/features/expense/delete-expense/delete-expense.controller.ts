import { Controller, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { DeleteExpenseHandler } from './delete-expense.handler';
import { DeleteExpenseCommand } from './delete-expense.command';

@Controller('billing/expenses')
@UseGuards(AuthGuard)
export class DeleteExpenseController {
  constructor(private readonly handler: DeleteExpenseHandler) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.handler.execute(new DeleteExpenseCommand(id, user.labId));
  }
}
