import { Inject, Injectable } from '@nestjs/common';
import { SeedTemplatesCommand } from './seed-templates.command';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import {
  ITemplateRepository,
  TEMPLATE_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/template/interfaces/template.repository.interface';

@Injectable()
export class SeedTemplatesHandler {
  constructor(
    @Inject(TEMPLATE_REPOSITORY_TOKEN)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(command: SeedTemplatesCommand): Promise<TestPanel[]> {
    const { labId, dto } = command;
    return this.templateRepository.seedTemplatesForLab(labId, dto.templateIds);
  }
}
