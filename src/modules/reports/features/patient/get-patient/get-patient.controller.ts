import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetPatientQuery } from './get-patient.query';
import { GetPatientHandler } from './get-patient.handler';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';

@Controller('patients')
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
