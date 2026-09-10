import { PublishEventDto } from './publish-event.dto';

export class PublishEventCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: PublishEventDto,
  ) {}
}
