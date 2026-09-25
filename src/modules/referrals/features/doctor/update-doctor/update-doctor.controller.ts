import { Controller, Patch, Param, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { UpdateDoctorHandler } from './update-doctor.handler';
import { UpdateDoctorCommand } from './update-doctor.command';
import { UpdateDoctorDto } from './update-doctor.dto';

@Controller('referrals/doctors')
export class UpdateDoctorController {
  constructor(private readonly handler: UpdateDoctorHandler) {}

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.handler.execute(
      new UpdateDoctorCommand(id, user.labId, dto),
    );
  }
}
