import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { AdminGetPlansController } from './admin-get-plans.controller';
import { AdminGetPlansHandler } from './admin-get-plans.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [AdminGetPlansController],
  providers: [AdminGetPlansHandler],
  exports: [AdminGetPlansHandler],
})
export class AdminGetPlansModule {}
