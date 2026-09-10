import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsGateway } from '../infrastructure/gateways/events.gateway';
import { ReportFinalizedEvent } from 'src/modules/reports/events/report-finalized.event';
import { ReportFinalizedWebSocketEvent } from 'src/modules/reports/events/report-finalized.websocket-event';
import { CollectionCreatedEvent } from 'src/modules/collections/events/collection-created.event';
import { CollectionCreatedWebSocketEvent } from 'src/modules/collections/events/collection-created.websocket-event';
import { CollectionAssignedEvent } from 'src/modules/collections/events/collection-assigned.event';
import { CollectionAssignedWebSocketEvent } from 'src/modules/collections/events/collection-assigned.websocket-event';
import { CollectionStatusUpdatedEvent } from 'src/modules/collections/events/collection-status-updated.event';
import { CollectionStatusUpdatedWebSocketEvent } from 'src/modules/collections/events/collection-status-updated.websocket-event';

@Injectable()
export class DomainEventsBridgeListener {
  private readonly logger = new Logger(DomainEventsBridgeListener.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  @OnEvent('report.finalized')
  handleReportFinalized(event: ReportFinalizedEvent): void {
    try {
      const wsEvent = new ReportFinalizedWebSocketEvent(event.labId, {
        reportId: event.reportId,
        labId: event.labId,
        patientId: event.patientId,
        reportNumber: event.reportNumber,
        totalPrice: Number(event.totalPrice),
        finalizedAt:
          event.finalizedAt instanceof Date
            ? event.finalizedAt.toISOString()
            : String(event.finalizedAt),
      });

      this.eventsGateway.publishToClients(wsEvent.getBroadcastPayload());
    } catch (error: any) {
      this.logger.error(
        `Failed to bridge report.finalized event to WebSockets: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('collection.created')
  handleCollectionCreated(event: CollectionCreatedEvent): void {
    try {
      const wsEvent = new CollectionCreatedWebSocketEvent(event.labId, {
        collectionId: event.collectionId,
        labId: event.labId,
        requestNumber: event.requestNumber,
        patientName: event.patientName,
        preferredDate:
          event.preferredDate instanceof Date
            ? event.preferredDate.toISOString()
            : String(event.preferredDate),
        timeSlot: event.timeSlot,
      });

      this.eventsGateway.publishToClients(wsEvent.getBroadcastPayload());
    } catch (error: any) {
      this.logger.error(
        `Failed to bridge collection.created event to WebSockets: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('collection.assigned')
  handleCollectionAssigned(event: CollectionAssignedEvent): void {
    try {
      const wsEvent = new CollectionAssignedWebSocketEvent(event.labId, {
        collectionId: event.collectionId,
        labId: event.labId,
        requestNumber: event.requestNumber,
        phlebotomistId: event.phlebotomistId,
        phlebotomistName: event.phlebotomistName,
      });

      this.eventsGateway.publishToClients(wsEvent.getBroadcastPayload());
    } catch (error: any) {
      this.logger.error(
        `Failed to bridge collection.assigned event to WebSockets: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('collection.status_updated')
  handleCollectionStatusUpdated(event: CollectionStatusUpdatedEvent): void {
    try {
      const wsEvent = new CollectionStatusUpdatedWebSocketEvent(event.labId, {
        collectionId: event.collectionId,
        labId: event.labId,
        requestNumber: event.requestNumber,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
      });

      this.eventsGateway.publishToClients(wsEvent.getBroadcastPayload());
    } catch (error: any) {
      this.logger.error(
        `Failed to bridge collection.status_updated event to WebSockets: ${error.message}`,
        error.stack,
      );
    }
  }
}
