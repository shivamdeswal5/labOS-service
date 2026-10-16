import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { GetTenantInvoicesController } from './get-tenant-invoices.controller';
import { GetTenantInvoicesHandler } from './get-tenant-invoices.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [GetTenantInvoicesController],
  providers: [GetTenantInvoicesHandler],
  exports: [GetTenantInvoicesHandler],
})
export class GetTenantInvoicesModule {}
