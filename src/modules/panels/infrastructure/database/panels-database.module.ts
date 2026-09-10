import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import { PanelSection } from 'src/modules/panels/domain/panel/panel-section.entity';
import { PanelParameter } from 'src/modules/panels/domain/panel/panel-parameter.entity';
import { TestPackage } from 'src/modules/panels/domain/package/test-package.entity';
import { PackagePanel } from 'src/modules/panels/domain/package/package-panel.entity';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';
import {
  PANEL_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/panel/interfaces/panel.repository.interface';
import {
  PACKAGE_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/package/interfaces/package.repository.interface';
import {
  TEMPLATE_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/template/interfaces/template.repository.interface';
import { PanelRepository } from './repositories/panel.repository';
import { PackageRepository } from './repositories/package.repository';
import { TemplateRepository } from './repositories/template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TestPanel,
      PanelSection,
      PanelParameter,
      TestPackage,
      PackagePanel,
      PanelTemplate,
    ]),
  ],
  providers: [
    {
      provide: PANEL_REPOSITORY_TOKEN,
      useClass: PanelRepository,
    },
    {
      provide: PACKAGE_REPOSITORY_TOKEN,
      useClass: PackageRepository,
    },
    {
      provide: TEMPLATE_REPOSITORY_TOKEN,
      useClass: TemplateRepository,
    },
  ],
  exports: [
    PANEL_REPOSITORY_TOKEN,
    PACKAGE_REPOSITORY_TOKEN,
    TEMPLATE_REPOSITORY_TOKEN,
  ],
})
export class PanelsDatabaseModule {}
