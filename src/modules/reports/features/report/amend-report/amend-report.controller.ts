import { Controller, Post, Param, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { AmendReportHandler } from './amend-report.handler';
import { AmendReportCommand } from './amend-report.command';
import { AmendReportDto } from './amend-report.dto';

@Controller('reports')
export class AmendReportController {
  constructor(private readonly handler: AmendReportHandler) {}

  @Post(':id/amend')
  async amend(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AmendReportDto,
  ) {
    return this.handler.execute(
      new AmendReportCommand(id, user.labId, user.id, dto),
    );
  }
}
