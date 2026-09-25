import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetFinancialSummaryHandler } from './get-financial-summary.handler';
import { GetFinancialSummaryQuery } from './get-financial-summary.query';

@Controller('billing/financial-summary')
export class GetFinancialSummaryController {
  constructor(private readonly handler: GetFinancialSummaryHandler) { }

  @Get()
  async getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.handler.execute(
      new GetFinancialSummaryQuery(user.labId, startDate, endDate),
    );
  }
}
