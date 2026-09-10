import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListReportsQuery } from './list-reports.query';
import { ListReportsHandler } from './list-reports.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';

@Controller('reports')
@UseGuards(AuthGuard)
export class ListReportsController {
  constructor(private readonly handler: ListReportsHandler) {}

  @Get()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: ReportStatusEnum,
    @Query('patientId') patientId?: string,
  ): Promise<Report[]> {
    return this.handler.execute(new ListReportsQuery(user.labId, status, patientId));
  }
}
