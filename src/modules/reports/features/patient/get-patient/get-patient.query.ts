export class GetPatientQuery {
  constructor(
    public readonly patientId: string,
    public readonly labId: string,
  ) {}
}
