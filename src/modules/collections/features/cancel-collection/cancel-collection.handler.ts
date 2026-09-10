import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CancelCollectionCommand } from './cancel-collection.command';
import {
  ICollectionRequestRepository,
  COLLECTION_REQUEST_REPOSITORY,
} from '../../domain/collection/interfaces/collection-request-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainValidationException } from 'src/modules/shared/domain/exceptions/domain-validation.exception';
import { CollectionRequest } from '../../domain/collection/collection-request.entity';
import { CollectionStatusEnum } from '../../domain/collection/enums/collection-status.enum';
import { CollectionStatusUpdatedEvent } from '../../events/collection-status-updated.event';

@Injectable()
export class CancelCollectionHandler {
  constructor(
    @Inject(COLLECTION_REQUEST_REPOSITORY)
    private readonly repo: ICollectionRequestRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CancelCollectionCommand): Promise<CollectionRequest> {
    const { labId, id, dto } = command;

    const collection = await this.repo.findById(id, labId);
    if (!collection) {
      throw new EntityNotFoundException('CollectionRequest', id);
    }

    if (collection.status === CollectionStatusEnum.DELIVERED_TO_LAB) {
      throw new DomainValidationException(
        'Cannot cancel a collection that has already been delivered to the lab',
      );
    }

    const previousStatus = collection.status;
    collection.status = CollectionStatusEnum.CANCELLED;
    collection.cancellationReason = dto.cancellationReason;

    const saved = await this.repo.save(collection);

    this.eventEmitter.emit(
      'collection.status_updated',
      new CollectionStatusUpdatedEvent(
        saved.id,
        saved.labId,
        saved.requestNumber,
        previousStatus,
        saved.status,
      ),
    );

    return saved;
  }
}
