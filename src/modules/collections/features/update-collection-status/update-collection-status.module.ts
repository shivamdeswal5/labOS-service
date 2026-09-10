import { Module } from '@nestjs/common';
import { CollectionsDatabaseModule } from '../../infrastructure/database/collections-database.module';
import { UpdateCollectionStatusController } from './update-collection-status.controller';
import { UpdateCollectionStatusHandler } from './update-collection-status.handler';

@Module({
  imports: [CollectionsDatabaseModule],
  controllers: [UpdateCollectionStatusController],
  providers: [UpdateCollectionStatusHandler],
  exports: [UpdateCollectionStatusHandler],
})
export class UpdateCollectionStatusModule {}
