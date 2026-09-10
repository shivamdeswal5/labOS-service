import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { CreatePanelController } from './create-panel.controller';
import { CreatePanelHandler } from './create-panel.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [CreatePanelController],
  providers: [CreatePanelHandler],
  exports: [CreatePanelHandler],
})
export class CreatePanelModule {}
