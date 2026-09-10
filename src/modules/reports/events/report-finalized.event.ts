export class ReportFinalizedEvent {
  constructor(
    public readonly reportId: string,
    public readonly labId: string,
    public readonly patientId: string,
    public readonly refByDoctorId: string | null,
    public readonly reportNumber: string,
    public readonly finalizedAt: Date,
    public readonly finalizedByUserId: string,
    public readonly totalPrice: number,
  ) {}
}
