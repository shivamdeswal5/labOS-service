import { WebSocketEvent } from 'src/modules/shared/domain/common/websocket-event';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { ICollectionStatusUpdatedPayload } from 'src/modules/websockets/contracts/payloads/collection-realtime.payload';

export class CollectionStatusUpdatedWebSocketEvent extends WebSocketEvent<ICollectionStatusUpdatedPayload> {
  readonly channels: string[];
  readonly eventName = RealtimeChannelEnum.COLLECTION_STATUS_UPDATED;

  constructor(labId: string, payload: ICollectionStatusUpdatedPayload) {
    super(labId, payload);
    this.channels = [RealtimeRoomBuilder.lab(labId)];
  }
}
