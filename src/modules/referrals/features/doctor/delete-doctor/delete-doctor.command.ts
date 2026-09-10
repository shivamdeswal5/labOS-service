export class DeleteDoctorCommand {
  constructor(
    public readonly doctorId: string,
    public readonly labId: string,
  ) {}
}
