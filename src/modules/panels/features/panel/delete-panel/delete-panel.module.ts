import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { DeletePanelController } from './delete-panel.controller';
import { DeletePanelHandler } from './delete-panel.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [DeletePanelController],
  providers: [DeletePanelHandler],
  exports: [DeletePanelHandler],
})
export class DeletePanelModule {}
