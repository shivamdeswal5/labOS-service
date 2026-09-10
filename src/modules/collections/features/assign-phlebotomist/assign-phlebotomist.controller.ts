import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { AssignPhlebotomistHandler } from './assign-phlebotomist.handler';
import { AssignPhlebotomistCommand } from './assign-phlebotomist.command';
import { AssignPhlebotomistDto } from './assign-phlebotomist.dto';

@Controller('collections')
@UseGuards(AuthGuard)
export class AssignPhlebotomistController {
  constructor(private readonly handler: AssignPhlebotomistHandler) { }

  @Patch(':id/assign')
  async assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPhlebotomistDto,
  ) {
    return this.handler.execute(
      new AssignPhlebotomistCommand(user.labId, id, dto),
    );
  }
}
