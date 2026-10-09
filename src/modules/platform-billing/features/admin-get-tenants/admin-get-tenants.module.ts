import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { AdminGetTenantsController } from './admin-get-tenants.controller';
import { AdminGetTenantsHandler } from './admin-get-tenants.handler';

@Module({
  imports: [LabsDatabaseModule, PlatformBillingDatabaseModule],
  controllers: [AdminGetTenantsController],
  providers: [AdminGetTenantsHandler],
  exports: [AdminGetTenantsHandler],
})
export class AdminGetTenantsModule {}
