import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { WebsocketsModule } from '../../../websockets/websockets.module';
import { ScheduleSubscriptionDowngradeController } from './schedule-subscription-downgrade.controller';
import { ScheduleSubscriptionDowngradeHandler } from './schedule-subscription-downgrade.handler';

@Module({
  imports: [PlatformBillingDatabaseModule, WebsocketsModule],
  controllers: [ScheduleSubscriptionDowngradeController],
  providers: [ScheduleSubscriptionDowngradeHandler],
  exports: [ScheduleSubscriptionDowngradeHandler],
})
export class ScheduleSubscriptionDowngradeModule {}
