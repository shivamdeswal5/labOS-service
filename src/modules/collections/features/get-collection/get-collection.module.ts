import { Module } from '@nestjs/common';
import { CollectionsDatabaseModule } from '../../infrastructure/database/collections-database.module';
import { GetCollectionController } from './get-collection.controller';
import { GetCollectionHandler } from './get-collection.handler';

@Module({
  imports: [CollectionsDatabaseModule],
  controllers: [GetCollectionController],
  providers: [GetCollectionHandler],
  exports: [GetCollectionHandler],
})
export class GetCollectionModule {}
