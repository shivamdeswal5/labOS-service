import { ScheduleSubscriptionDowngradeDto } from './schedule-subscription-downgrade.dto';

export class ScheduleSubscriptionDowngradeCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: ScheduleSubscriptionDowngradeDto,
  ) {}
}
