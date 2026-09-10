import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { SendNotificationHandler } from './send-notification.handler';
import { SendNotificationCommand } from './send-notification.command';
import { SendNotificationDto } from './send-notification.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class SendNotificationController {
  constructor(private readonly handler: SendNotificationHandler) {}

  @Post('send')
  async send(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendNotificationDto,
  ) {
    return this.handler.execute(new SendNotificationCommand(user.labId, dto));
  }
}
