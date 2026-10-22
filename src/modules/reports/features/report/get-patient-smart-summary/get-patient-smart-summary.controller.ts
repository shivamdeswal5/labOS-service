import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/modules/shared/decorators/public.decorator';
import { GetPatientSmartSummaryHandler } from './get-patient-smart-summary.handler';
import { GetPatientSmartSummaryQuery } from './get-patient-smart-summary.query';
import { PatientSmartSummary } from 'src/modules/shared/infrastructure/ai/interfaces/ai-service.interface';

@Controller('reports')
export class GetPatientSmartSummaryController {
  constructor(private readonly handler: GetPatientSmartSummaryHandler) {}

  @Public()
  @Get('share/:token/ai-summary')
  async getByToken(@Param('token') token: string): Promise<PatientSmartSummary> {
    return this.handler.execute(new GetPatientSmartSummaryQuery(token));
  }
}
