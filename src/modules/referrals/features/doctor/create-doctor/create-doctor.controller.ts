import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateDoctorHandler } from './create-doctor.handler';
import { CreateDoctorCommand } from './create-doctor.command';
import { CreateDoctorDto } from './create-doctor.dto';

@Controller('referrals/doctors')
@UseGuards(AuthGuard)
export class CreateDoctorController {
  constructor(private readonly handler: CreateDoctorHandler) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDoctorDto,
  ) {
    return this.handler.execute(new CreateDoctorCommand(user.labId, dto));
  }
}
