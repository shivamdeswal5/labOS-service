import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { UpdatePatientDto } from './update-patient.dto';
import { UpdatePatientCommand } from './update-patient.command';
import { UpdatePatientHandler } from './update-patient.handler';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';

@Controller('patients')
@UseGuards(AuthGuard)
export class UpdatePatientController {
  constructor(private readonly handler: UpdatePatientHandler) {}

  @Patch(':id')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') patientId: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<Patient> {
    return this.handler.execute(new UpdatePatientCommand(patientId, user.labId, dto));
  }
}
