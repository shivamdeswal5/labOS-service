import { Controller, Post, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateOutsourcedTestHandler } from './create-outsourced-test.handler';
import { CreateOutsourcedTestCommand } from './create-outsourced-test.command';
import { CreateOutsourcedTestDto } from './create-outsourced-test.dto';

@Controller('referrals/outsourced')
export class CreateOutsourcedTestController {
  constructor(private readonly handler: CreateOutsourcedTestHandler) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOutsourcedTestDto,
  ) {
    return this.handler.execute(
      new CreateOutsourcedTestCommand(user.labId, dto),
    );
  }
}
