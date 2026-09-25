import { Controller, Patch, Param, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { UpdateExpenseHandler } from './update-expense.handler';
import { UpdateExpenseCommand } from './update-expense.command';
import { UpdateExpenseDto } from './update-expense.dto';

@Controller('expenses')
export class UpdateExpenseController {
  constructor(private readonly handler: UpdateExpenseHandler) { }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.handler.execute(
      new UpdateExpenseCommand(id, user.labId, dto),
    );
  }
}
