import { Inject, Injectable } from '@nestjs/common';
import { GetPanelQuery } from './get-panel.query';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import {
  IPanelRepository,
  PANEL_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/panel/interfaces/panel.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetPanelHandler {
  constructor(
    @Inject(PANEL_REPOSITORY_TOKEN)
    private readonly panelRepository: IPanelRepository,
  ) {}

  async execute(query: GetPanelQuery): Promise<TestPanel> {
    const { labId, panelId } = query;

    const panel = await this.panelRepository.findById(panelId, labId);
    if (!panel) {
      throw new EntityNotFoundException('TestPanel', panelId);
    }

    return panel;
  }
}
