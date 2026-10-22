import { Module } from '@nestjs/common';
import { GenerateClinicalRemarksController } from './generate-clinical-remarks.controller';
import { GenerateClinicalRemarksHandler } from './generate-clinical-remarks.handler';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { AiModule } from 'src/modules/shared/infrastructure/ai/ai.module';

@Module({
  imports: [ReportsDatabaseModule, AiModule],
  controllers: [GenerateClinicalRemarksController],
  providers: [GenerateClinicalRemarksHandler],
  exports: [GenerateClinicalRemarksHandler],
})
export class GenerateClinicalRemarksModule {}
