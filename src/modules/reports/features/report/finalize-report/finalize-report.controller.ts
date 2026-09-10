import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { FinalizeReportCommand } from './finalize-report.command';
import { FinalizeReportHandler } from './finalize-report.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';

@Controller('reports')
@UseGuards(AuthGuard)
export class FinalizeReportController {
  constructor(private readonly handler: FinalizeReportHandler) {}

  @Post(':id/finalize')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reportId: string,
  ): Promise<Report> {
    return this.handler.execute(
      new FinalizeReportCommand(reportId, user.labId, user.id),
    );
  }
}
