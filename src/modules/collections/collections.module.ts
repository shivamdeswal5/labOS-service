import { Module } from '@nestjs/common';
import { CollectionsDatabaseModule } from './infrastructure/database/collections-database.module';
import { CreateCollectionModule } from './features/create-collection/create-collection.module';
import { GetCollectionModule } from './features/get-collection/get-collection.module';
import { ListCollectionsModule } from './features/list-collections/list-collections.module';
import { AssignPhlebotomistModule } from './features/assign-phlebotomist/assign-phlebotomist.module';
import { UpdateCollectionStatusModule } from './features/update-collection-status/update-collection-status.module';
import { CancelCollectionModule } from './features/cancel-collection/cancel-collection.module';

@Module({
  imports: [
    CollectionsDatabaseModule,
    CreateCollectionModule,
    GetCollectionModule,
    ListCollectionsModule,
    AssignPhlebotomistModule,
    UpdateCollectionStatusModule,
    CancelCollectionModule,
  ],
  exports: [
    CollectionsDatabaseModule,
    CreateCollectionModule,
    GetCollectionModule,
    ListCollectionsModule,
    AssignPhlebotomistModule,
    UpdateCollectionStatusModule,
    CancelCollectionModule,
  ],
})
export class CollectionsModule {}
