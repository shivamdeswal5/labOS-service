import { Inject, Injectable } from '@nestjs/common';
import { GetCollectionQuery } from './get-collection.query';
import {
  ICollectionRequestRepository,
  COLLECTION_REQUEST_REPOSITORY,
} from '../../domain/collection/interfaces/collection-request-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { CollectionRequest } from '../../domain/collection/collection-request.entity';

@Injectable()
export class GetCollectionHandler {
  constructor(
    @Inject(COLLECTION_REQUEST_REPOSITORY)
    private readonly repo: ICollectionRequestRepository,
  ) {}

  async execute(query: GetCollectionQuery): Promise<CollectionRequest> {
    const { labId, id } = query;
    const collection = await this.repo.findById(id, labId);
    if (!collection) {
      throw new EntityNotFoundException('CollectionRequest', id);
    }
    return collection;
  }
}
