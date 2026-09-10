import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from 'src/modules/reports/infrastructure/database/reports-database.module';
import { EnterResultsController } from './enter-results.controller';
import { EnterResultsHandler } from './enter-results.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [EnterResultsController],
  providers: [EnterResultsHandler],
  exports: [EnterResultsHandler],
})
export class EnterResultsModule {}
