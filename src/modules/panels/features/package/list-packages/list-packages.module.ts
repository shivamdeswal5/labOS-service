import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { ListPackagesController } from './list-packages.controller';
import { ListPackagesHandler } from './list-packages.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [ListPackagesController],
  providers: [ListPackagesHandler],
  exports: [ListPackagesHandler],
})
export class ListPackagesModule {}
