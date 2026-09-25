import { Controller, Get } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetCommissionSummaryHandler } from './get-commission-summary.handler';
import { GetCommissionSummaryQuery } from './get-commission-summary.query';

@Controller('referrals/commission')
export class GetCommissionSummaryController {
  constructor(private readonly handler: GetCommissionSummaryHandler) {}

  @Get('summary')
  async getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.handler.execute(new GetCommissionSummaryQuery(user.labId));
  }
}
