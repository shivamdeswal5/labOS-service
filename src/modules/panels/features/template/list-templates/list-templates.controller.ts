import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { ListTemplatesQuery } from './list-templates.query';
import { ListTemplatesHandler } from './list-templates.handler';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';

@Controller('panels/templates')
@UseGuards(AuthGuard, RolesGuard)
export class ListTemplatesController {
  constructor(private readonly handler: ListTemplatesHandler) {}

  @Get('all')
  async execute(): Promise<PanelTemplate[]> {
    return this.handler.execute(new ListTemplatesQuery());
  }
}
