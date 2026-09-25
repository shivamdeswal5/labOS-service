import { Controller, Post, Body } from '@nestjs/common';
import { Roles } from 'src/modules/shared/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { CreatePanelDto } from './create-panel.dto';
import { CreatePanelCommand } from './create-panel.command';
import { CreatePanelHandler } from './create-panel.handler';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Controller('panels')
export class CreatePanelController {
  constructor(private readonly handler: CreatePanelHandler) {}

  @Post()
  @Roles(RoleEnum.OWNER, RoleEnum.PATHOLOGIST)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePanelDto,
  ): Promise<TestPanel> {
    return this.handler.execute(new CreatePanelCommand(user.labId, dto));
  }
}
