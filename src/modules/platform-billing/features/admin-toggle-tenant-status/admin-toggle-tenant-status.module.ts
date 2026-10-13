import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { WebsocketsModule } from 'src/modules/websockets/websockets.module';
import { AdminToggleTenantStatusController } from './admin-toggle-tenant-status.controller';
import { AdminToggleTenantStatusHandler } from './admin-toggle-tenant-status.handler';

@Module({
  imports: [PlatformBillingDatabaseModule, WebsocketsModule],
  controllers: [AdminToggleTenantStatusController],
  providers: [AdminToggleTenantStatusHandler],
  exports: [AdminToggleTenantStatusHandler],
})
export class AdminToggleTenantStatusModule {}
