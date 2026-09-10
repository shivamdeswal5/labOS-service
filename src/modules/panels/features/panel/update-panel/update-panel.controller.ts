import { Controller, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { Roles } from 'src/modules/shared/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { UpdatePanelDto } from './update-panel.dto';
import { UpdatePanelCommand } from './update-panel.command';
import { UpdatePanelHandler } from './update-panel.handler';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Controller('panels')
@UseGuards(AuthGuard, RolesGuard)
export class UpdatePanelController {
  constructor(private readonly handler: UpdatePanelHandler) {}

  @Put(':id')
  @Roles(RoleEnum.OWNER, RoleEnum.PATHOLOGIST)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePanelDto,
  ): Promise<TestPanel> {
    return this.handler.execute(new UpdatePanelCommand(user.labId, id, dto));
  }
}
