import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { SupabaseModule } from 'src/modules/shared/infrastructure/supabase/supabase.module';
import { AdminImpersonateTenantController } from './admin-impersonate-tenant.controller';
import { AdminImpersonateTenantHandler } from './admin-impersonate-tenant.handler';

@Module({
  imports: [LabsDatabaseModule, SupabaseModule],
  controllers: [AdminImpersonateTenantController],
  providers: [AdminImpersonateTenantHandler],
  exports: [AdminImpersonateTenantHandler],
})
export class AdminImpersonateTenantModule {}
