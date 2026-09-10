import { Controller, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { EnterResultsDto } from './enter-results.dto';
import { EnterResultsCommand } from './enter-results.command';
import { EnterResultsHandler } from './enter-results.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';

@Controller('reports')
@UseGuards(AuthGuard)
export class EnterResultsController {
  constructor(private readonly handler: EnterResultsHandler) {}

  @Put(':id/results')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reportId: string,
    @Body() dto: EnterResultsDto,
  ): Promise<Report> {
    return this.handler.execute(new EnterResultsCommand(reportId, user.labId, dto));
  }
}
