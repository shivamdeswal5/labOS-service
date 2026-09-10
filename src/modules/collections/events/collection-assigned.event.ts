export class CollectionAssignedEvent {
  constructor(
    public readonly collectionId: string,
    public readonly labId: string,
    public readonly requestNumber: string,
    public readonly phlebotomistId: string,
    public readonly phlebotomistName: string,
  ) {}
}
