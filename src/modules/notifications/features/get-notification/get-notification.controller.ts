import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { GetNotificationHandler } from './get-notification.handler';
import { GetNotificationQuery } from './get-notification.query';

@Controller('notifications')
export class GetNotificationController {
  constructor(private readonly handler: GetNotificationHandler) { }

  @Get(':id')
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.handler.execute(new GetNotificationQuery(user.labId, id));
  }
}
