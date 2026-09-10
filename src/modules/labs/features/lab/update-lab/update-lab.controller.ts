import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { Roles } from 'src/modules/shared/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { UpdateLabDto } from './update-lab.dto';
import { UpdateLabCommand } from './update-lab.command';
import { UpdateLabHandler } from './update-lab.handler';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';

@Controller('labs')
@UseGuards(AuthGuard, RolesGuard)
export class UpdateLabController {
  constructor(private readonly handler: UpdateLabHandler) {}

  @Put('current')
  @Roles(RoleEnum.OWNER)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLabDto,
  ): Promise<Lab> {
    return this.handler.execute(new UpdateLabCommand(user.labId, dto));
  }
}
