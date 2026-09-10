import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetPanelQuery } from './get-panel.query';
import { GetPanelHandler } from './get-panel.handler';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Controller('panels')
@UseGuards(AuthGuard, RolesGuard)
export class GetPanelController {
  constructor(private readonly handler: GetPanelHandler) {}

  @Get(':id')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<TestPanel> {
    return this.handler.execute(new GetPanelQuery(user.labId, id));
  }
}
