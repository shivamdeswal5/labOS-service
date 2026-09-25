import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListPanelsQuery } from './list-panels.query';
import { ListPanelsHandler } from './list-panels.handler';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Controller('panels')
export class ListPanelsController {
  constructor(private readonly handler: ListPanelsHandler) {}

  @Get()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Query('category') category?: string,
  ): Promise<TestPanel[]> {
    return this.handler.execute(new ListPanelsQuery(user.labId, category));
  }
}
