export class LabCreatedEvent {
  constructor(
    public readonly labId: string,
    public readonly labName: string,
    public readonly ownerId: string,
    public readonly ownerFullName: string,
    public readonly planSlug?: string,
    public readonly billingCycle?: string,
  ) {}
}
