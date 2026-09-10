import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { Roles } from 'src/modules/shared/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { AddMemberDto } from './add-member.dto';
import { AddMemberCommand } from './add-member.command';
import { AddMemberHandler } from './add-member.handler';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';

@Controller('labs')
@UseGuards(AuthGuard, RolesGuard)
export class AddMemberController {
  constructor(private readonly handler: AddMemberHandler) {}

  @Post('members')
  @Roles(RoleEnum.OWNER)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddMemberDto,
  ): Promise<Profile> {
    return this.handler.execute(new AddMemberCommand(user.labId, dto));
  }
}
