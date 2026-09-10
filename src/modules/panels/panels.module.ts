import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from './infrastructure/database/panels-database.module';
import { PanelFeatureModule } from './features/panel/panel-feature.module';
import { PackageFeatureModule } from './features/package/package-feature.module';
import { TemplateFeatureModule } from './features/template/template-feature.module';

@Module({
  imports: [
    PanelsDatabaseModule,
    PanelFeatureModule,
    PackageFeatureModule,
    TemplateFeatureModule,
  ],
  exports: [
    PanelsDatabaseModule,
    PanelFeatureModule,
    PackageFeatureModule,
    TemplateFeatureModule,
  ],
})
export class PanelsModule {}
