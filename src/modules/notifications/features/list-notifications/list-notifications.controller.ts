import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { ListNotificationsHandler } from './list-notifications.handler';
import { ListNotificationsQuery } from './list-notifications.query';
import { NotificationChannelEnum } from '../../domain/notification/enums/notification-channel.enum';
import { NotificationStatusEnum } from '../../domain/notification/enums/notification-status.enum';
import { NotificationTypeEnum } from '../../domain/notification/enums/notification-type.enum';
import { RecipientTypeEnum } from '../../domain/notification/enums/recipient-type.enum';

@Controller('notifications')
@UseGuards(AuthGuard)
export class ListNotificationsController {
  constructor(private readonly handler: ListNotificationsHandler) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('channel') channel?: NotificationChannelEnum,
    @Query('status') status?: NotificationStatusEnum,
    @Query('recipientType') recipientType?: RecipientTypeEnum,
    @Query('notificationType') notificationType?: NotificationTypeEnum,
    @Query('destination') destination?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handler.execute(
      new ListNotificationsQuery(
        user.labId,
        channel,
        status,
        recipientType,
        notificationType,
        destination,
        page,
        limit,
      ),
    );
  }
}
