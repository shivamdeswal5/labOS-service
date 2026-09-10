export class DeletePanelCommand {
  constructor(
    public readonly labId: string,
    public readonly panelId: string,
  ) {}
}
