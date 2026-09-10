import { Inject, Injectable } from '@nestjs/common';
import { UpdatePanelCommand } from './update-panel.command';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import {
  IPanelRepository,
  PANEL_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/panel/interfaces/panel.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class UpdatePanelHandler {
  constructor(
    @Inject(PANEL_REPOSITORY_TOKEN)
    private readonly panelRepository: IPanelRepository,
  ) {}

  async execute(command: UpdatePanelCommand): Promise<TestPanel> {
    const { labId, panelId, dto } = command;

    const updated = await this.panelRepository.updateWithStructure(panelId, labId, dto);
    if (!updated) {
      throw new EntityNotFoundException('TestPanel', panelId);
    }

    return updated;
  }
}
