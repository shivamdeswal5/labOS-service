import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetDoctorHandler } from './get-doctor.handler';
import { GetDoctorQuery } from './get-doctor.query';

@Controller('referrals/doctors')
@UseGuards(AuthGuard)
export class GetDoctorController {
  constructor(private readonly handler: GetDoctorHandler) {}

  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.handler.execute(new GetDoctorQuery(id, user.labId));
  }
}
