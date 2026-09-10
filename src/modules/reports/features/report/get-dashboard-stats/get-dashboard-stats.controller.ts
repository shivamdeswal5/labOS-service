import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetDashboardStatsHandler } from './get-dashboard-stats.handler';
import { GetDashboardStatsQuery } from './get-dashboard-stats.query';
import { DashboardStatsDto } from './get-dashboard-stats.dto';

@Controller('reports')
@UseGuards(AuthGuard)
export class GetDashboardStatsController {
  constructor(private readonly handler: GetDashboardStatsHandler) {}

  @Get('dashboard-stats')
  async execute(@CurrentUser() user: AuthenticatedUser): Promise<DashboardStatsDto> {
    return this.handler.execute(new GetDashboardStatsQuery(user.labId));
  }
}
