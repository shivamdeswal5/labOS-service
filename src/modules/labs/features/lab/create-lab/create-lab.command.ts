import { CreateLabDto } from './create-lab.dto';

export class CreateLabCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateLabDto,
  ) {}
}
