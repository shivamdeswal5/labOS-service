import { CreateCollectionDto } from './create-collection.dto';

export class CreateCollectionCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreateCollectionDto,
  ) {}
}
