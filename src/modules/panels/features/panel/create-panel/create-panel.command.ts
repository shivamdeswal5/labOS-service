import { CreatePanelDto } from './create-panel.dto';

export class CreatePanelCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreatePanelDto,
  ) {}
}
