import { Controller, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { DeleteReportCommand } from './delete-report.command';
import { DeleteReportHandler } from './delete-report.handler';

@Controller('reports')
export class DeleteReportController {
  constructor(private readonly handler: DeleteReportHandler) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reportId: string,
  ): Promise<void> {
    return this.handler.execute(new DeleteReportCommand(reportId, user.labId));
  }
}
