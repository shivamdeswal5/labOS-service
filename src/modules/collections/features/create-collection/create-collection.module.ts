import { Module } from '@nestjs/common';
import { CollectionsDatabaseModule } from '../../infrastructure/database/collections-database.module';
import { CreateCollectionController } from './create-collection.controller';
import { CreateCollectionHandler } from './create-collection.handler';

@Module({
  imports: [CollectionsDatabaseModule],
  controllers: [CreateCollectionController],
  providers: [CreateCollectionHandler],
  exports: [CreateCollectionHandler],
})
export class CreateCollectionModule {}
