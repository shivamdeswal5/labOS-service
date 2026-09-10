import { UpdateDoctorDto } from './update-doctor.dto';

export class UpdateDoctorCommand {
  constructor(
    public readonly doctorId: string,
    public readonly labId: string,
    public readonly dto: UpdateDoctorDto,
  ) {}
}
