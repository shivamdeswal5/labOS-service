import {
  Controller,
  Post,
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
import { ResendNotificationHandler } from './resend-notification.handler';
import { ResendNotificationCommand } from './resend-notification.command';
import { ResendNotificationDto } from './resend-notification.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class ResendNotificationController {
  constructor(private readonly handler: ResendNotificationHandler) {}

  @Post(':id/resend')
  async resend(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResendNotificationDto,
  ) {
    return this.handler.execute(
      new ResendNotificationCommand(user.labId, id, dto),
    );
  }
}
