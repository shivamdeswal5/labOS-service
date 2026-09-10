export class CollectionCreatedEvent {
  constructor(
    public readonly collectionId: string,
    public readonly labId: string,
    public readonly requestNumber: string,
    public readonly patientName: string,
    public readonly preferredDate: Date,
    public readonly timeSlot: string,
  ) {}
}
