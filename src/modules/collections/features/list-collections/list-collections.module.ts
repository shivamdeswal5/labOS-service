import { Module } from '@nestjs/common';
import { CollectionsDatabaseModule } from '../../infrastructure/database/collections-database.module';
import { ListCollectionsController } from './list-collections.controller';
import { ListCollectionsHandler } from './list-collections.handler';

@Module({
  imports: [CollectionsDatabaseModule],
  controllers: [ListCollectionsController],
  providers: [ListCollectionsHandler],
  exports: [ListCollectionsHandler],
})
export class ListCollectionsModule {}
