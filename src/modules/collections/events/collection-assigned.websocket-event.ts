import { WebSocketEvent } from 'src/modules/shared/domain/common/websocket-event';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { ICollectionAssignedPayload } from 'src/modules/websockets/contracts/payloads/collection-realtime.payload';

export class CollectionAssignedWebSocketEvent extends WebSocketEvent<ICollectionAssignedPayload> {
  readonly channels: string[];
  readonly eventName = RealtimeChannelEnum.COLLECTION_ASSIGNED;

  constructor(labId: string, payload: ICollectionAssignedPayload) {
    super(labId, payload);
    this.channels = [
      RealtimeRoomBuilder.lab(labId),
      RealtimeRoomBuilder.user(payload.phlebotomistId),
    ];
  }
}
