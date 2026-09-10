import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetCommissionSummaryHandler } from './get-commission-summary.handler';
import { GetCommissionSummaryQuery } from './get-commission-summary.query';

@Controller('referrals/commission')
@UseGuards(AuthGuard)
export class GetCommissionSummaryController {
  constructor(private readonly handler: GetCommissionSummaryHandler) {}

  @Get('summary')
  async getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.handler.execute(new GetCommissionSummaryQuery(user.labId));
  }
}
