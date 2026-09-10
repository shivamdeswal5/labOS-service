import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCollectionCommand } from './create-collection.command';
import {
  ICollectionRequestRepository,
  COLLECTION_REQUEST_REPOSITORY,
} from '../../domain/collection/interfaces/collection-request-repository.interface';
import { CollectionRequest } from '../../domain/collection/collection-request.entity';
import { CollectionStatusEnum } from '../../domain/collection/enums/collection-status.enum';
import { CollectionCreatedEvent } from '../../events/collection-created.event';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';

@Injectable()
export class CreateCollectionHandler {
  constructor(
    @Inject(COLLECTION_REQUEST_REPOSITORY)
    private readonly repo: ICollectionRequestRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateCollectionCommand): Promise<CollectionRequest> {
    const { labId, dto } = command;

    const requestNumber = await this.repo.generateRequestNumber(labId);

    const isAssigned = !!dto.assignedPhlebotomistId;
    const initialStatus = isAssigned
      ? CollectionStatusEnum.ASSIGNED
      : CollectionStatusEnum.REQUESTED;

    const collection = await this.repo.create({
      labId,
      requestNumber,
      patientId: dto.patientId ?? null,
      patientName: dto.patientName,
      patientPhone: dto.patientPhone,
      patientAge: dto.patientAge ?? null,
      patientSex: dto.patientSex ?? SexEnum.OTHER,
      address: dto.address,
      preferredDate: new Date(dto.preferredDate),
      timeSlot: dto.timeSlot,
      status: initialStatus,
      assignedPhlebotomistId: dto.assignedPhlebotomistId ?? null,
      assignedPhlebotomistName: dto.assignedPhlebotomistName ?? null,
      isFastingRequired: dto.isFastingRequired ?? false,
      testNames: dto.testNames ?? [],
      specialInstructions: dto.specialInstructions ?? null,
      samples: [],
    });

    this.eventEmitter.emit(
      'collection.created',
      new CollectionCreatedEvent(
        collection.id,
        collection.labId,
        collection.requestNumber,
        collection.patientName,
        collection.preferredDate,
        collection.timeSlot,
      ),
    );

    return collection;
  }
}
