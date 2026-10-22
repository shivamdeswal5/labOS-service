import { GenerateClinicalRemarksDto } from './generate-clinical-remarks.dto';

export class GenerateClinicalRemarksCommand {
  constructor(
    public readonly reportId: string,
    public readonly labId: string,
    public readonly dto?: GenerateClinicalRemarksDto,
  ) {}
}
