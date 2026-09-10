import { UpdatePanelDto } from './update-panel.dto';

export class UpdatePanelCommand {
  constructor(
    public readonly labId: string,
    public readonly panelId: string,
    public readonly dto: UpdatePanelDto,
  ) {}
}
