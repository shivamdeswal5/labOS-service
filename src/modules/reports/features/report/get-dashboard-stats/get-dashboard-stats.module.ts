import { Module } from '@nestjs/common';
import { ReportsDatabaseModule } from '../../../infrastructure/database/reports-database.module';
import { GetDashboardStatsController } from './get-dashboard-stats.controller';
import { GetDashboardStatsHandler } from './get-dashboard-stats.handler';

@Module({
  imports: [ReportsDatabaseModule],
  controllers: [GetDashboardStatsController],
  providers: [GetDashboardStatsHandler],
  exports: [GetDashboardStatsHandler],
})
export class GetDashboardStatsModule {}
