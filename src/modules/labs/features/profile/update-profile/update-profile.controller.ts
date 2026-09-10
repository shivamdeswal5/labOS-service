import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { UpdateProfileDto } from './update-profile.dto';
import { UpdateProfileCommand } from './update-profile.command';
import { UpdateProfileHandler } from './update-profile.handler';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';

@Controller('labs')
@UseGuards(AuthGuard)
export class UpdateProfileController {
  constructor(private readonly handler: UpdateProfileHandler) {}

  @Put('me')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.handler.execute(new UpdateProfileCommand(user.id, dto));
  }
}
