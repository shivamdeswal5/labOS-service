import { Controller, Post, Param, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GenerateClinicalRemarksDto } from './generate-clinical-remarks.dto';
import { GenerateClinicalRemarksCommand } from './generate-clinical-remarks.command';
import { GenerateClinicalRemarksHandler } from './generate-clinical-remarks.handler';

@Controller('reports')
export class GenerateClinicalRemarksController {
  constructor(private readonly handler: GenerateClinicalRemarksHandler) {}

  @Post(':id/ai-impression')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reportId: string,
    @Body() dto: GenerateClinicalRemarksDto,
  ): Promise<{ impression: string }> {
    return this.handler.execute(
      new GenerateClinicalRemarksCommand(reportId, user.labId, dto),
    );
  }
}
