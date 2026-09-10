import { CollectionRequest } from '../collection-request.entity';
import { CollectionStatusEnum } from '../enums/collection-status.enum';

export interface FindCollectionsFilter {
  status?: CollectionStatusEnum;
  phlebotomistId?: string;
  preferredDate?: string;
  patientPhone?: string;
}

export interface ICollectionRequestRepository {
  save(collection: CollectionRequest): Promise<CollectionRequest>;
  create(data: Partial<CollectionRequest>): Promise<CollectionRequest>;
  findById(id: string, labId: string): Promise<CollectionRequest | null>;
  findByLabId(
    labId: string,
    filter?: FindCollectionsFilter,
  ): Promise<CollectionRequest[]>;
  generateRequestNumber(labId: string): Promise<string>;
  softDelete(id: string, labId: string): Promise<boolean>;
}

export const COLLECTION_REQUEST_REPOSITORY = Symbol(
  'ICollectionRequestRepository',
);
