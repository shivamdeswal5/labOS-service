import { CreatePatientDto } from './create-patient.dto';

export class CreatePatientCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreatePatientDto,
  ) {}
}
