import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { UpdatePanelController } from './update-panel.controller';
import { UpdatePanelHandler } from './update-panel.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [UpdatePanelController],
  providers: [UpdatePanelHandler],
  exports: [UpdatePanelHandler],
})
export class UpdatePanelModule {}
