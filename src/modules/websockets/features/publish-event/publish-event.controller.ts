import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { PublishEventHandler } from './publish-event.handler';
import { PublishEventCommand } from './publish-event.command';
import { PublishEventDto } from './publish-event.dto';

@Controller('events')
@UseGuards(AuthGuard)
export class PublishEventController {
  constructor(private readonly handler: PublishEventHandler) {}

  @Post('publish')
  async publish(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PublishEventDto,
  ) {
    return this.handler.execute(new PublishEventCommand(user.labId, dto));
  }
}
