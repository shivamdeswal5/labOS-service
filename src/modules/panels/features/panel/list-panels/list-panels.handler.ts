import { Inject, Injectable } from '@nestjs/common';
import { ListPanelsQuery } from './list-panels.query';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import {
  IPanelRepository,
  PANEL_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/panel/interfaces/panel.repository.interface';

@Injectable()
export class ListPanelsHandler {
  constructor(
    @Inject(PANEL_REPOSITORY_TOKEN)
    private readonly panelRepository: IPanelRepository,
  ) {}

  async execute(query: ListPanelsQuery): Promise<TestPanel[]> {
    return this.panelRepository.findByLabId(query.labId, query.category);
  }
}
