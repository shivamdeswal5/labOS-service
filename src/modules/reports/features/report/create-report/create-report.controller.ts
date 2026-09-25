import { Controller, Post, Body, ForbiddenException } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateReportDto } from './create-report.dto';
import { CreateReportCommand } from './create-report.command';
import { CreateReportHandler } from './create-report.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';

@Controller('reports')
export class CreateReportController {
  constructor(private readonly handler: CreateReportHandler) {}

  @Post()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReportDto,
  ): Promise<Report> {
    if (!user.labId) {
      throw new ForbiddenException(
        'No laboratory associated with this account. Please complete onboarding first.',
      );
    }
    return this.handler.execute(new CreateReportCommand(user.labId, dto));
  }
}
