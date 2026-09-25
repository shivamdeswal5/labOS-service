import { Controller, Post, Body } from '@nestjs/common';
import { Roles } from 'src/modules/shared/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { SeedTemplatesDto } from './seed-templates.dto';
import { SeedTemplatesCommand } from './seed-templates.command';
import { SeedTemplatesHandler } from './seed-templates.handler';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Controller('panels/templates')
export class SeedTemplatesController {
  constructor(private readonly handler: SeedTemplatesHandler) {}

  @Post('seed')
  @Roles(RoleEnum.OWNER)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SeedTemplatesDto,
  ): Promise<TestPanel[]> {
    return this.handler.execute(new SeedTemplatesCommand(user.labId, dto));
  }
}
