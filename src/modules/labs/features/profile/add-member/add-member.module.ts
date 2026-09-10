import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { AddMemberController } from './add-member.controller';
import { AddMemberHandler } from './add-member.handler';

@Module({
  imports: [LabsDatabaseModule],
  controllers: [AddMemberController],
  providers: [AddMemberHandler],
  exports: [AddMemberHandler],
})
export class AddMemberModule {}
