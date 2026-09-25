import { Controller, Get } from '@nestjs/common';
import { ListTemplatesQuery } from './list-templates.query';
import { ListTemplatesHandler } from './list-templates.handler';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';

@Controller('panels/templates')
export class ListTemplatesController {
  constructor(private readonly handler: ListTemplatesHandler) {}

  @Get('all')
  async execute(): Promise<PanelTemplate[]> {
    return this.handler.execute(new ListTemplatesQuery());
  }
}
