import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { AdminUpdatePlanController } from './admin-update-plan.controller';
import { AdminUpdatePlanHandler } from './admin-update-plan.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [AdminUpdatePlanController],
  providers: [AdminUpdatePlanHandler],
  exports: [AdminUpdatePlanHandler],
})
export class AdminUpdatePlanModule {}
