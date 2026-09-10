import { WebSocketEvent } from 'src/modules/shared/domain/common/websocket-event';
import { RealtimeChannelEnum } from 'src/modules/websockets/contracts/enums/realtime-channel.enum';
import { RealtimeRoomBuilder } from 'src/modules/websockets/contracts/realtime-room.builder';
import { IReportFinalizedPayload } from 'src/modules/websockets/contracts/payloads/report-realtime.payload';

export class ReportFinalizedWebSocketEvent extends WebSocketEvent<IReportFinalizedPayload> {
  readonly channels: string[];
  readonly eventName = RealtimeChannelEnum.REPORT_FINALIZED;

  constructor(labId: string, payload: IReportFinalizedPayload) {
    super(labId, payload);
    this.channels = [RealtimeRoomBuilder.lab(labId)];
  }
}
