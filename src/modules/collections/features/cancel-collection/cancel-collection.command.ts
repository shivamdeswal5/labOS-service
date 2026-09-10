import { CancelCollectionDto } from './cancel-collection.dto';

export class CancelCollectionCommand {
  constructor(
    public readonly labId: string,
    public readonly id: string,
    public readonly dto: CancelCollectionDto,
  ) {}
}
