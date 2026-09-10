import { Module } from '@nestjs/common';
import { SeedTemplatesModule } from './seed-templates/seed-templates.module';
import { ListTemplatesModule } from './list-templates/list-templates.module';

@Module({
  imports: [SeedTemplatesModule, ListTemplatesModule],
  exports: [SeedTemplatesModule, ListTemplatesModule],
})
export class TemplateFeatureModule {}
