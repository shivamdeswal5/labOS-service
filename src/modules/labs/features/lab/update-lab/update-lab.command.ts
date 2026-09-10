import { UpdateLabDto } from './update-lab.dto';

export class UpdateLabCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: UpdateLabDto,
  ) {}
}
