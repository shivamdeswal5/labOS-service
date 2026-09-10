import { Module } from '@nestjs/common';
import { CollectionsDatabaseModule } from '../../infrastructure/database/collections-database.module';
import { CancelCollectionController } from './cancel-collection.controller';
import { CancelCollectionHandler } from './cancel-collection.handler';

@Module({
  imports: [CollectionsDatabaseModule],
  controllers: [CancelCollectionController],
  providers: [CancelCollectionHandler],
  exports: [CancelCollectionHandler],
})
export class CancelCollectionModule {}
