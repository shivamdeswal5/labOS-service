import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetDoctorHandler } from './get-doctor.handler';
import { GetDoctorQuery } from './get-doctor.query';

@Controller('referrals/doctors')
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
