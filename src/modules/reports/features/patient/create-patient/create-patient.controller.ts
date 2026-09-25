import { Controller, Post, Body, ForbiddenException } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreatePatientDto } from './create-patient.dto';
import { CreatePatientCommand } from './create-patient.command';
import { CreatePatientHandler } from './create-patient.handler';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';

@Controller('patients')
export class CreatePatientController {
  constructor(private readonly handler: CreatePatientHandler) {}

  @Post()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePatientDto,
  ): Promise<Patient> {
    if (!user.labId) {
      throw new ForbiddenException(
        'No laboratory associated with this account. Please complete onboarding first.',
      );
    }
    return this.handler.execute(new CreatePatientCommand(user.labId, dto));
  }
}
