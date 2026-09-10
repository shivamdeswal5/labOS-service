import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListPanelsQuery } from './list-panels.query';
import { ListPanelsHandler } from './list-panels.handler';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Controller('panels')
@UseGuards(AuthGuard, RolesGuard)
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
