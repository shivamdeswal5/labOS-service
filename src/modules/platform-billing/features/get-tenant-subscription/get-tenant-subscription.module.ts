import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { GetTenantSubscriptionController } from './get-tenant-subscription.controller';
import { GetTenantSubscriptionHandler } from './get-tenant-subscription.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [GetTenantSubscriptionController],
  providers: [GetTenantSubscriptionHandler],
  exports: [GetTenantSubscriptionHandler],
})
export class GetTenantSubscriptionModule {}
