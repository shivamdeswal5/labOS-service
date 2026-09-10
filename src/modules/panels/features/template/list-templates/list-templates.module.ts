import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { ListTemplatesController } from './list-templates.controller';
import { ListTemplatesHandler } from './list-templates.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [ListTemplatesController],
  providers: [ListTemplatesHandler],
  exports: [ListTemplatesHandler],
})
export class ListTemplatesModule {}
