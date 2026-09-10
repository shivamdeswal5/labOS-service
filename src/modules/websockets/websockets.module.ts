import { Module } from '@nestjs/common';
import { EventsGatewayModule } from './infrastructure/gateways/events-gateway.module';
import { PublishEventModule } from './features/publish-event/publish-event.module';
import { DomainEventsBridgeListener } from './listeners/domain-events-bridge.listener';

@Module({
  imports: [EventsGatewayModule, PublishEventModule],
  providers: [DomainEventsBridgeListener],
  exports: [EventsGatewayModule, PublishEventModule],
})
export class WebsocketsModule {}
