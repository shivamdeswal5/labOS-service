import { WebSocketEvent } from 'src/modules/shared/domain/common/websocket-event';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { ICollectionCreatedPayload } from 'src/modules/websockets/contracts/payloads/collection-realtime.payload';

export class CollectionCreatedWebSocketEvent extends WebSocketEvent<ICollectionCreatedPayload> {
  readonly channels: string[];
  readonly eventName = RealtimeChannelEnum.COLLECTION_CREATED;

  constructor(labId: string, payload: ICollectionCreatedPayload) {
    super(labId, payload);
    this.channels = [RealtimeRoomBuilder.lab(labId)];
  }
}
