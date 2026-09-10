import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventsGateway } from '../../infrastructure/gateways/events.gateway';
import { PublishEventCommand } from './publish-event.command';
import { EventMessage } from '../../contracts/event-message.interface';

@Injectable()
export class PublishEventHandler {
  private readonly logger = new Logger(PublishEventHandler.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  async execute(
    command: PublishEventCommand,
  ): Promise<{ success: boolean; traceId: string }> {
    const { labId, dto } = command;
    const traceId = randomUUID();

    const scopedChannels = dto.channels.map((ch) => {
      if (ch.startsWith('lab:') || ch.startsWith('user:')) {
        return ch;
      }
      return `lab:${labId}:${ch}`;
    });

    const message: EventMessage = {
      channels: scopedChannels,
      event: dto.event,
      timestamp: new Date().toISOString(),
      traceId,
      payload: {
        ...dto.payload,
        labId,
      },
    };

    this.eventsGateway.publishToClients(message);

    this.logger.log(
      `Published event [${dto.event}] initiated via REST for lab [${labId}]`,
    );

    return {
      success: true,
      traceId,
    };
  }
}
