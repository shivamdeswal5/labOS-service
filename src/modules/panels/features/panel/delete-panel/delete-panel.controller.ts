import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { Roles } from 'src/modules/shared/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { DeletePanelCommand } from './delete-panel.command';
import { DeletePanelHandler } from './delete-panel.handler';

@Controller('panels')
@UseGuards(AuthGuard, RolesGuard)
export class DeletePanelController {
  constructor(private readonly handler: DeletePanelHandler) {}

  @Delete(':id')
  @Roles(RoleEnum.OWNER)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.handler.execute(new DeletePanelCommand(user.labId, id));
    return { success: true, message: 'Panel deleted successfully' };
  }
}
