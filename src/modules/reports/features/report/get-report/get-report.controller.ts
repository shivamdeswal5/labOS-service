import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetReportQuery } from './get-report.query';
import { GetReportHandler } from './get-report.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';

@Controller('reports')
@UseGuards(AuthGuard)
export class GetReportController {
  constructor(private readonly handler: GetReportHandler) {}

  @Get(':id')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reportId: string,
  ): Promise<Report> {
    return this.handler.execute(new GetReportQuery(reportId, user.labId));
  }
}
