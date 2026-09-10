import { describe, it, expect } from 'vitest';
import { RealtimeRoomBuilder } from './realtime-room.builder';
import { RealtimeChannelEnum } from './enums/realtime-channel.enum';
import { ReportFinalizedWebSocketEvent } from 'src/modules/reports/events/report-finalized.websocket-event';
import { CollectionAssignedWebSocketEvent } from 'src/modules/collections/events/collection-assigned.websocket-event';

describe('WebSockets Domain Contracts', () => {
  describe('RealtimeRoomBuilder', () => {
    it('constructs correct room names with multi-tenant namespace', () => {
      expect(RealtimeRoomBuilder.lab('lab-123')).toBe('lab:lab-123');
      expect(RealtimeRoomBuilder.doctors('lab-123')).toBe('lab:lab-123:doctors');
      expect(RealtimeRoomBuilder.phlebotomists('lab-123')).toBe('lab:lab-123:phlebotomists');
      expect(RealtimeRoomBuilder.user('user-456')).toBe('user:user-456');
    });
  });

  describe('WebSocketEvent Base Contract & Broadcast Envelope', () => {
    it('produces compliant CloudEvents-style envelope for ReportFinalizedWebSocketEvent', () => {
      const event = new ReportFinalizedWebSocketEvent('lab-123', {
        reportId: 'rep-1',
        labId: 'lab-123',
        patientId: 'pat-1',
        patientName: 'John Doe',
        reportNumber: 'REP-2026-001',
        totalPrice: 1500,
        finalizedAt: '2026-09-08T12:00:00.000Z',
      });

      const envelope = event.getBroadcastPayload();

      expect(envelope.event).toBe(RealtimeChannelEnum.REPORT_FINALIZED);
      expect(envelope.channels).toEqual(['lab:lab-123']);
      expect(envelope.traceId).toBeDefined();
      expect(typeof envelope.traceId).toBe('string');
      expect(envelope.timestamp).toBeDefined();
      expect(envelope.payload.reportNumber).toBe('REP-2026-001');
      expect(envelope.payload.totalPrice).toBe(1500);
    });

    it('produces compliant CloudEvents-style envelope for CollectionAssignedWebSocketEvent with targeted user room', () => {
      const event = new CollectionAssignedWebSocketEvent('lab-123', {
        collectionId: 'col-1',
        labId: 'lab-123',
        requestNumber: 'REQ-001',
        phlebotomistId: 'phleb-789',
        phlebotomistName: 'Alice Phleb',
      });

      const envelope = event.getBroadcastPayload();

      expect(envelope.event).toBe(RealtimeChannelEnum.COLLECTION_ASSIGNED);
      expect(envelope.channels).toEqual(['lab:lab-123', 'user:phleb-789']);
      expect(envelope.payload.phlebotomistId).toBe('phleb-789');
    });
  });
});
