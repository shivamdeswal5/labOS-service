import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetProfileQuery } from './get-profile.query';
import { GetProfileHandler } from './get-profile.handler';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';

@Controller('labs')
@UseGuards(AuthGuard)
export class GetProfileController {
  constructor(private readonly handler: GetProfileHandler) {}

  @Get('me')
  async execute(@CurrentUser() user: AuthenticatedUser): Promise<Profile> {
    return this.handler.execute(new GetProfileQuery(user.id));
  }
}
