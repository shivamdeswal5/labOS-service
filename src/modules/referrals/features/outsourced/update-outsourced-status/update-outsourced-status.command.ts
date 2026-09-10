import { UpdateOutsourcedStatusDto } from './update-outsourced-status.dto';

export class UpdateOutsourcedStatusCommand {
  constructor(
    public readonly testId: string,
    public readonly labId: string,
    public readonly dto: UpdateOutsourcedStatusDto,
  ) {}
}
