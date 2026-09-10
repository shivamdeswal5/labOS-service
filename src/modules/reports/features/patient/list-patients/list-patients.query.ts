export class ListPatientsQuery {
  constructor(
    public readonly labId: string,
    public readonly search?: string,
  ) {}
}
