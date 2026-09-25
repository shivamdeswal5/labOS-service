import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * GuardsModule — globally registers AuthGuard and RolesGuard as APP_GUARD singletons.
 *
 * By registering guards here with APP_GUARD, NestJS resolves their dependencies at
 * the AppModule level. This avoids the anti-pattern of importing LabsDatabaseModule
 * (or any other provider module) into every feature module just to satisfy guard deps.
 *
 * The @Global() decorator ensures that any feature module can use @UseGuards(AuthGuard)
 * and @UseGuards(RolesGuard) decorators without additional imports.
 */
@Global()
@Module({
  imports: [LabsDatabaseModule],
  providers: [
    AuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthGuard, RolesGuard],
})
export class GuardsModule {}
