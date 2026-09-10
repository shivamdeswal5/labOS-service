import { UpdatePatientDto } from './update-patient.dto';

export class UpdatePatientCommand {
  constructor(
    public readonly patientId: string,
    public readonly labId: string,
    public readonly dto: UpdatePatientDto,
  ) {}
}
