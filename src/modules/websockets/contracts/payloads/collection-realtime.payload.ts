import { CollectionStatusEnum } from 'src/modules/collections/domain/collection/enums/collection-status.enum';

export interface ICollectionCreatedPayload {
  collectionId: string;
  labId: string;
  requestNumber: string;
  patientName: string;
  preferredDate: string;
  timeSlot: string;
}

export interface ICollectionAssignedPayload {
  collectionId: string;
  labId: string;
  requestNumber: string;
  phlebotomistId: string;
  phlebotomistName: string;
}

export interface ICollectionStatusUpdatedPayload {
  collectionId: string;
  labId: string;
  requestNumber: string;
  previousStatus: CollectionStatusEnum;
  newStatus: CollectionStatusEnum;
}
