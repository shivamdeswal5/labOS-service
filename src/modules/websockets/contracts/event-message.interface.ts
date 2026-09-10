import { RealtimeChannelEnum } from './enums/realtime-channel.enum';

export interface EventMessage<T = any> {
  channels: string[];
  event: RealtimeChannelEnum;
  timestamp: string;
  traceId: string;
  payload: T;
}
