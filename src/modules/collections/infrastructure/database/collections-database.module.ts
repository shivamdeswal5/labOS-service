import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionRequest } from 'src/modules/collections/domain/collection/collection-request.entity';
import { CollectionSample } from 'src/modules/collections/domain/collection/collection-sample.entity';
import { COLLECTION_REQUEST_REPOSITORY } from 'src/modules/collections/domain/collection/interfaces/collection-request-repository.interface';
import { CollectionRequestRepository } from './repositories/collection-request.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionRequest, CollectionSample])],
  providers: [
    {
      provide: COLLECTION_REQUEST_REPOSITORY,
      useClass: CollectionRequestRepository,
    },
  ],
  exports: [COLLECTION_REQUEST_REPOSITORY],
})
export class CollectionsDatabaseModule {}
