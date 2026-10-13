import { Controller, Post, Body, ForbiddenException, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { SubscriptionIntakeGuard } from 'src/modules/platform-billing/guards/subscription-intake.guard';
import { CreateReportDto } from './create-report.dto';
import { CreateReportCommand } from './create-report.command';
import { CreateReportHandler } from './create-report.handler';
import { Report } from 'src/modules/reports/domain/report/report.entity';

@Controller('reports')
export class CreateReportController {
  constructor(private readonly handler: CreateReportHandler) {}

  @Post()
  @UseGuards(SubscriptionIntakeGuard)
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
