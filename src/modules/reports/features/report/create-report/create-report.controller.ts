import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateReportDto } from './create-report.dto';
import { CreateReportCommand } from './create-report.command';
import { CreateReportHandler } from './create-report.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';

@Controller('reports')
@UseGuards(AuthGuard)
export class CreateReportController {
  constructor(private readonly handler: CreateReportHandler) {}

  @Post()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReportDto,
  ): Promise<Report> {
    return this.handler.execute(new CreateReportCommand(user.labId, dto));
  }
}
