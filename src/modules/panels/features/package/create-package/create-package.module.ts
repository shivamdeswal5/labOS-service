import { Module } from '@nestjs/common';
import { PanelsDatabaseModule } from 'src/modules/panels/infrastructure/database/panels-database.module';
import { CreatePackageController } from './create-package.controller';
import { CreatePackageHandler } from './create-package.handler';

@Module({
  imports: [PanelsDatabaseModule],
  controllers: [CreatePackageController],
  providers: [CreatePackageHandler],
  exports: [CreatePackageHandler],
})
export class CreatePackageModule {}
