import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { PreviewSubscriptionTransitionController } from './preview-subscription-transition.controller';
import { PreviewSubscriptionTransitionHandler } from './preview-subscription-transition.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [PreviewSubscriptionTransitionController],
  providers: [PreviewSubscriptionTransitionHandler],
  exports: [PreviewSubscriptionTransitionHandler],
})
export class PreviewSubscriptionTransitionModule {}
