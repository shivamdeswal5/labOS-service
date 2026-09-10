import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { GetPanelController } from './get-panel.controller';
import { GetPanelHandler } from './get-panel.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [GetPanelController],
  providers: [GetPanelHandler],
  exports: [GetPanelHandler],
})
export class GetPanelModule {}
