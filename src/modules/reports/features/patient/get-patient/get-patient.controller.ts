import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetPatientQuery } from './get-patient.query';
import { GetPatientHandler } from './get-patient.handler';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';

@Controller('patients')
@UseGuards(AuthGuard)
export class GetPatientController {
  constructor(private readonly handler: GetPatientHandler) {}

  @Get(':id')
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') patientId: string,
  ): Promise<Patient> {
    return this.handler.execute(new GetPatientQuery(patientId, user.labId));
  }
}
