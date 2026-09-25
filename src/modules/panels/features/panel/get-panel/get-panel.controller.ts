import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetPanelQuery } from './get-panel.query';
import { GetPanelHandler } from './get-panel.handler';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Controller('panels')
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
