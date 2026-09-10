import { Inject, Injectable } from '@nestjs/common';
import { ListTemplatesQuery } from './list-templates.query';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';
import {
  ITemplateRepository,
  TEMPLATE_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/template/interfaces/template.repository.interface';

@Injectable()
export class ListTemplatesHandler {
  constructor(
    @Inject(TEMPLATE_REPOSITORY_TOKEN)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(_query: ListTemplatesQuery): Promise<PanelTemplate[]> {
    return this.templateRepository.findAll();
  }
}
