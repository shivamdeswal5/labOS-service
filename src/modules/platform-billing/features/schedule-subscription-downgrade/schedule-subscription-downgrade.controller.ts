import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { ScheduleSubscriptionDowngradeHandler } from './schedule-subscription-downgrade.handler';
import { ScheduleSubscriptionDowngradeCommand } from './schedule-subscription-downgrade.command';
import { ScheduleSubscriptionDowngradeDto } from './schedule-subscription-downgrade.dto';

@Controller('billing/subscriptions/schedule-downgrade')
export class ScheduleSubscriptionDowngradeController {
  constructor(private readonly handler: ScheduleSubscriptionDowngradeHandler) {}

  @Post()
  async scheduleDowngrade(
    @Req() req: any,
    @Body() dto: ScheduleSubscriptionDowngradeDto,
  ) {
    const labId = req.user?.labId;
    if (!labId) {
      throw new BadRequestException('User is not associated with an active laboratory');
    }

    return this.handler.execute(new ScheduleSubscriptionDowngradeCommand(labId, dto));
  }
}
