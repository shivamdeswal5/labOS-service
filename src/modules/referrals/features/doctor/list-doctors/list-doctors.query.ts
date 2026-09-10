export class ListDoctorsQuery {
  constructor(
    public readonly labId: string,
    public readonly search?: string,
  ) {}
}
