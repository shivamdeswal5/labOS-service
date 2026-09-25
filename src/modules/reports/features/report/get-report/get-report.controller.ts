import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetReportQuery } from './get-report.query';
import { GetReportHandler } from './get-report.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';

@Controller('reports')
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
