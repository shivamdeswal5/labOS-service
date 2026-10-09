import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { AdminManualActivationModule } from '../admin-manual-activation/admin-manual-activation.module';
import { AdminCreateTenantController } from './admin-create-tenant.controller';
import { AdminCreateTenantHandler } from './admin-create-tenant.handler';

@Module({
  imports: [
    LabsDatabaseModule,
    PlatformBillingDatabaseModule,
    AdminManualActivationModule,
  ],
  controllers: [AdminCreateTenantController],
  providers: [AdminCreateTenantHandler],
  exports: [AdminCreateTenantHandler],
})
export class AdminCreateTenantModule {}
