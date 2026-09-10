import { Inject, Injectable } from '@nestjs/common';
import { CreatePanelCommand } from './create-panel.command';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import {
  IPanelRepository,
  PANEL_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/panel/interfaces/panel.repository.interface';

@Injectable()
export class CreatePanelHandler {
  constructor(
    @Inject(PANEL_REPOSITORY_TOKEN)
    private readonly panelRepository: IPanelRepository,
  ) {}

  async execute(command: CreatePanelCommand): Promise<TestPanel> {
    const { labId, dto } = command;

    return this.panelRepository.saveWithStructure(
      {
        labId,
        name: dto.name,
        category: dto.category,
        price: dto.price,
        sortOrder: dto.sortOrder,
      },
      dto.sections,
    );
  }
}
