import { Inject, Injectable } from '@nestjs/common';
import { DeletePanelCommand } from './delete-panel.command';
import {
  IPanelRepository,
  PANEL_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/panel/interfaces/panel.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class DeletePanelHandler {
  constructor(
    @Inject(PANEL_REPOSITORY_TOKEN)
    private readonly panelRepository: IPanelRepository,
  ) {}

  async execute(command: DeletePanelCommand): Promise<void> {
    const { labId, panelId } = command;

    const deleted = await this.panelRepository.delete(panelId, labId);
    if (!deleted) {
      throw new EntityNotFoundException('TestPanel', panelId);
    }
  }
}
