import { Controller, Get } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListMembersHandler } from './list-members.handler';
import { ListMembersQuery } from './list-members.query';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';

@Controller('labs')
export class ListMembersController {
  constructor(private readonly handler: ListMembersHandler) {}

  @Get('members')
  async execute(@CurrentUser() user: AuthenticatedUser): Promise<Profile[]> {
    return this.handler.execute(new ListMembersQuery(user.labId));
  }
}
