import { Module } from '@nestjs/common';
import { ListMembersController } from './list-members.controller';
import { ListMembersHandler } from './list-members.handler';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';

@Module({
  imports: [LabsDatabaseModule],
  controllers: [ListMembersController],
  providers: [ListMembersHandler],
  exports: [ListMembersHandler],
})
export class ListMembersModule {}
