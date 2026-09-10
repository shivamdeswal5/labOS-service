import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignPhlebotomistCommand } from './assign-phlebotomist.command';
import {
  ICollectionRequestRepository,
  COLLECTION_REQUEST_REPOSITORY,
} from '../../domain/collection/interfaces/collection-request-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainValidationException } from 'src/modules/shared/domain/exceptions/domain-validation.exception';
import { CollectionRequest } from '../../domain/collection/collection-request.entity';
import { CollectionStatusEnum } from '../../domain/collection/enums/collection-status.enum';
import { CollectionAssignedEvent } from '../../events/collection-assigned.event';

@Injectable()
export class AssignPhlebotomistHandler {
  constructor(
    @Inject(COLLECTION_REQUEST_REPOSITORY)
    private readonly repo: ICollectionRequestRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: AssignPhlebotomistCommand,
  ): Promise<CollectionRequest> {
    const { labId, id, dto } = command;

    const collection = await this.repo.findById(id, labId);
    if (!collection) {
      throw new EntityNotFoundException('CollectionRequest', id);
    }

    if (
      collection.status === CollectionStatusEnum.DELIVERED_TO_LAB ||
      collection.status === CollectionStatusEnum.CANCELLED
    ) {
      throw new DomainValidationException(
        `Cannot assign phlebotomist to a collection that is already ${collection.status}`,
      );
    }

    collection.assignedPhlebotomistId = dto.phlebotomistId;
    collection.assignedPhlebotomistName = dto.phlebotomistName;

    if (collection.status === CollectionStatusEnum.REQUESTED) {
      collection.status = CollectionStatusEnum.ASSIGNED;
    }

    const saved = await this.repo.save(collection);

    this.eventEmitter.emit(
      'collection.assigned',
      new CollectionAssignedEvent(
        saved.id,
        saved.labId,
        saved.requestNumber,
        dto.phlebotomistId,
        dto.phlebotomistName,
      ),
    );

    return saved;
  }
}
