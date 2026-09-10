import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { SeedTemplatesController } from './seed-templates.controller';
import { SeedTemplatesHandler } from './seed-templates.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [SeedTemplatesController],
  providers: [SeedTemplatesHandler],
  exports: [SeedTemplatesHandler],
})
export class SeedTemplatesModule {}
