export class GetDoctorQuery {
  constructor(
    public readonly doctorId: string,
    public readonly labId: string,
  ) {}
}
