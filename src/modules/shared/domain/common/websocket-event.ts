import { randomUUID } from 'crypto';
import { EventMessage } from 'src/modules/websockets/contracts/event-message.interface';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';

export abstract class WebSocketEvent<T = any> {
  abstract readonly channels: string[];
  abstract readonly eventName: RealtimeChannelEnum;

  constructor(
    public readonly labId: string,
    public readonly payload: T,
  ) {}

  getBroadcastPayload(): EventMessage<T> {
    return {
      channels: this.channels,
      event: this.eventName,
      timestamp: new Date().toISOString(),
      traceId: randomUUID(),
      payload: this.payload,
    };
  }
}
