import { CollectionStatusEnum } from '../domain/collection/enums/collection-status.enum';

export class CollectionStatusUpdatedEvent {
  constructor(
    public readonly collectionId: string,
    public readonly labId: string,
    public readonly requestNumber: string,
    public readonly previousStatus: CollectionStatusEnum,
    public readonly newStatus: CollectionStatusEnum,
  ) {}
}
