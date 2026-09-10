import { SeedTemplatesDto } from './seed-templates.dto';

export class SeedTemplatesCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: SeedTemplatesDto,
  ) {}
}
