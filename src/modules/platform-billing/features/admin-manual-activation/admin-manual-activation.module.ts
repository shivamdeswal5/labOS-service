import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { EventsGatewayModule } from 'src/modules/websockets/infrastructure/gateways/events-gateway.module';
import { AdminManualActivationController } from './admin-manual-activation.controller';
import { AdminManualActivationHandler } from './admin-manual-activation.handler';

@Module({
  imports: [PlatformBillingDatabaseModule, EventsGatewayModule],
  controllers: [AdminManualActivationController],
  providers: [AdminManualActivationHandler],
  exports: [AdminManualActivationHandler],
})
export class AdminManualActivationModule {}
