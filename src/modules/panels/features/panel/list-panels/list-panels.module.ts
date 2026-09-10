import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { ListPanelsController } from './list-panels.controller';
import { ListPanelsHandler } from './list-panels.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [ListPanelsController],
  providers: [ListPanelsHandler],
  exports: [ListPanelsHandler],
})
export class ListPanelsModule {}
