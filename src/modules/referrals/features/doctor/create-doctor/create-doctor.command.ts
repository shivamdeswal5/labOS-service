import { CreateDoctorDto } from './create-doctor.dto';

export class CreateDoctorCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreateDoctorDto,
  ) {}
}
