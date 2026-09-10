import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListOutsourcedTestsHandler } from './list-outsourced-tests.handler';
import { ListOutsourcedTestsQuery } from './list-outsourced-tests.query';
import { OutsourcedTestStatusEnum } from 'src/modules/referrals/domain/outsourced/enums/outsourced-test-status.enum';

@Controller('referrals/outsourced')
@UseGuards(AuthGuard)
export class ListOutsourcedTestsController {
  constructor(private readonly handler: ListOutsourcedTestsHandler) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: OutsourcedTestStatusEnum,
    @Query('reportId') reportId?: string,
  ) {
    return this.handler.execute(
      new ListOutsourcedTestsQuery(user.labId, status, reportId),
    );
  }
}
