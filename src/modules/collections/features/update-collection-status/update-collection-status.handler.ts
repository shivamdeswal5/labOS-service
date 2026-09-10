import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateCollectionStatusCommand } from './update-collection-status.command';
import {
  ICollectionRequestRepository,
  COLLECTION_REQUEST_REPOSITORY,
} from '../../domain/collection/interfaces/collection-request-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainValidationException } from 'src/modules/shared/domain/exceptions/domain-validation.exception';
import { CollectionRequest } from '../../domain/collection/collection-request.entity';
import { CollectionSample } from '../../domain/collection/collection-sample.entity';
import { CollectionStatusEnum } from '../../domain/collection/enums/collection-status.enum';
import { CollectionStatusUpdatedEvent } from '../../events/collection-status-updated.event';

@Injectable()
export class UpdateCollectionStatusHandler {
  constructor(
    @Inject(COLLECTION_REQUEST_REPOSITORY)
    private readonly repo: ICollectionRequestRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: UpdateCollectionStatusCommand,
  ): Promise<CollectionRequest> {
    const { labId, id, dto } = command;

    const collection = await this.repo.findById(id, labId);
    if (!collection) {
      throw new EntityNotFoundException('CollectionRequest', id);
    }

    if (collection.status === CollectionStatusEnum.CANCELLED) {
      throw new DomainValidationException(
        'Cannot update status of a cancelled collection request',
      );
    }

    const previousStatus = collection.status;
    collection.status = dto.status;

    if (
      dto.status === CollectionStatusEnum.SAMPLE_COLLECTED &&
      !collection.collectedAt
    ) {
      collection.collectedAt = new Date();
    }

    if (
      dto.status === CollectionStatusEnum.DELIVERED_TO_LAB &&
      !collection.deliveredToLabAt
    ) {
      collection.deliveredToLabAt = new Date();
    }

    if (dto.reportId) {
      collection.reportId = dto.reportId;
    }

    if (dto.samples && dto.samples.length > 0) {
      const newSamples: CollectionSample[] = dto.samples.map((s) => {
        const sample = new CollectionSample();
        sample.collectionRequestId = collection.id;
        sample.tubeType = s.tubeType;
        sample.barcode = s.barcode;
        sample.notes = s.notes ?? null;
        return sample;
      });

      collection.samples = [...(collection.samples || []), ...newSamples];
    }

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
