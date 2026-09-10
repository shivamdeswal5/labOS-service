export class ListPanelsQuery {
  constructor(
    public readonly labId: string,
    public readonly category?: string,
  ) {}
}
