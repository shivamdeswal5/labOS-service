import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateLabDto } from './create-lab.dto';
import { CreateLabCommand } from './create-lab.command';
import { CreateLabHandler } from './create-lab.handler';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';

@Controller('labs')
@UseGuards(AuthGuard)
export class CreateLabController {
  constructor(private readonly handler: CreateLabHandler) {}

  @Post()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLabDto,
  ): Promise<Lab> {
    return this.handler.execute(new CreateLabCommand(user.id, dto));
  }
}
