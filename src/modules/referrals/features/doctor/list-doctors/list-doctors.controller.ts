import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListDoctorsHandler } from './list-doctors.handler';
import { ListDoctorsQuery } from './list-doctors.query';

@Controller('referrals/doctors')
@UseGuards(AuthGuard)
export class ListDoctorsController {
  constructor(private readonly handler: ListDoctorsHandler) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
  ) {
    return this.handler.execute(new ListDoctorsQuery(user.labId, search));
  }
}
