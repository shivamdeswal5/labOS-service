import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreatePatientDto } from './create-patient.dto';
import { CreatePatientCommand } from './create-patient.command';
import { CreatePatientHandler } from './create-patient.handler';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';

@Controller('patients')
@UseGuards(AuthGuard)
export class CreatePatientController {
  constructor(private readonly handler: CreatePatientHandler) {}

  @Post()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePatientDto,
  ): Promise<Patient> {
    return this.handler.execute(new CreatePatientCommand(user.labId, dto));
  }
}
