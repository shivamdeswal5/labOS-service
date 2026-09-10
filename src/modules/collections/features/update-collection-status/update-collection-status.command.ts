import { UpdateCollectionStatusDto } from './update-collection-status.dto';

export class UpdateCollectionStatusCommand {
  constructor(
    public readonly labId: string,
    public readonly id: string,
    public readonly dto: UpdateCollectionStatusDto,
  ) {}
}
