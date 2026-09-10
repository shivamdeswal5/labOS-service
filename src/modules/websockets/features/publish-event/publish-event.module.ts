import { Module } from '@nestjs/common';
import { EventsGatewayModule } from '../../infrastructure/gateways/events-gateway.module';
import { PublishEventController } from './publish-event.controller';
import { PublishEventHandler } from './publish-event.handler';

@Module({
  imports: [EventsGatewayModule],
  controllers: [PublishEventController],
  providers: [PublishEventHandler],
  exports: [PublishEventHandler],
})
export class PublishEventModule {}
