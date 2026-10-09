import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { SuperAdminGuard } from './super-admin.guard';

/**
 * GuardsModule — globally registers AuthGuard and RolesGuard as APP_GUARD singletons,
 * and provides SuperAdminGuard for platform admin routes.
 */
@Global()
@Module({
  imports: [LabsDatabaseModule],
  providers: [
    AuthGuard,
    RolesGuard,
    SuperAdminGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthGuard, RolesGuard, SuperAdminGuard],
})
export class GuardsModule {}
