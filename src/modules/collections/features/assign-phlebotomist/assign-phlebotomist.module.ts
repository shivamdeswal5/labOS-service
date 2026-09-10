import { Module } from '@nestjs/common';
import { CollectionsDatabaseModule } from '../../infrastructure/database/collections-database.module';
import { AssignPhlebotomistController } from './assign-phlebotomist.controller';
import { AssignPhlebotomistHandler } from './assign-phlebotomist.handler';

@Module({
  imports: [CollectionsDatabaseModule],
  controllers: [AssignPhlebotomistController],
  providers: [AssignPhlebotomistHandler],
  exports: [AssignPhlebotomistHandler],
})
export class AssignPhlebotomistModule {}
