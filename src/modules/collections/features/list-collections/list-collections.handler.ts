import { Inject, Injectable } from '@nestjs/common';
import { ListCollectionsQuery } from './list-collections.query';
import {
  ICollectionRequestRepository,
  COLLECTION_REQUEST_REPOSITORY,
} from '../../domain/collection/interfaces/collection-request-repository.interface';
import { CollectionRequest } from '../../domain/collection/collection-request.entity';

@Injectable()
export class ListCollectionsHandler {
  constructor(
    @Inject(COLLECTION_REQUEST_REPOSITORY)
    private readonly repo: ICollectionRequestRepository,
  ) {}

  async execute(query: ListCollectionsQuery): Promise<CollectionRequest[]> {
    return this.repo.findByLabId(query.labId, {
      status: query.status,
      phlebotomistId: query.phlebotomistId,
      preferredDate: query.preferredDate,
      patientPhone: query.patientPhone,
    });
  }
}
