import { Module } from '@nestjs/common';
import { CreatePanelModule } from './create-panel/create-panel.module';
import { UpdatePanelModule } from './update-panel/update-panel.module';
import { GetPanelModule } from './get-panel/get-panel.module';
import { ListPanelsModule } from './list-panels/list-panels.module';
import { DeletePanelModule } from './delete-panel/delete-panel.module';

@Module({
  imports: [
    CreatePanelModule,
    UpdatePanelModule,
    GetPanelModule,
    ListPanelsModule,
    DeletePanelModule,
  ],
  exports: [
    CreatePanelModule,
    UpdatePanelModule,
    GetPanelModule,
    ListPanelsModule,
    DeletePanelModule,
  ],
})
export class PanelFeatureModule {}
