import { CollectionStatusEnum } from '../../domain/collection/enums/collection-status.enum';

export class ListCollectionsQuery {
  constructor(
    public readonly labId: string,
    public readonly status?: CollectionStatusEnum,
    public readonly phlebotomistId?: string,
    public readonly preferredDate?: string,
    public readonly patientPhone?: string,
  ) {}
}
