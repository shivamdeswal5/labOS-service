import { Module } from '@nestjs/common';
import { GetPatientSmartSummaryController } from './get-patient-smart-summary.controller';
import { GetPatientSmartSummaryHandler } from './get-patient-smart-summary.handler';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { AiModule } from 'src/modules/shared/infrastructure/ai/ai.module';

@Module({
  imports: [ReportsDatabaseModule, AiModule],
  controllers: [GetPatientSmartSummaryController],
  providers: [GetPatientSmartSummaryHandler],
  exports: [GetPatientSmartSummaryHandler],
})
export class GetPatientSmartSummaryModule {}
