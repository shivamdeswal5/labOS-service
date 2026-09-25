import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListPatientsQuery } from './list-patients.query';
import { ListPatientsHandler } from './list-patients.handler';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';

@Controller('patients')
export class ListPatientsController {
  constructor(private readonly handler: ListPatientsHandler) {}

  @Get()
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
  ): Promise<Patient[]> {
    return this.handler.execute(new ListPatientsQuery(user.labId, search));
  }
}
