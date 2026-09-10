import { EnterResultsDto } from './enter-results.dto';

export class EnterResultsCommand {
  constructor(
    public readonly reportId: string,
    public readonly labId: string,
    public readonly dto: EnterResultsDto,
  ) {}
}
