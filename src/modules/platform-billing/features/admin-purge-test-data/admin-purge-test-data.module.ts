import { Module } from '@nestjs/common';
import { AdminPurgeTestDataController } from './admin-purge-test-data.controller';
import { AdminPurgeTestDataHandler } from './admin-purge-test-data.handler';

@Module({
  controllers: [AdminPurgeTestDataController],
  providers: [AdminPurgeTestDataHandler],
  exports: [AdminPurgeTestDataHandler],
})
export class AdminPurgeTestDataModule {}
