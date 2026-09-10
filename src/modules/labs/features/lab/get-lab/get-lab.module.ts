import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { GetLabController } from './get-lab.controller';
import { GetLabHandler } from './get-lab.handler';

@Module({
  imports: [LabsDatabaseModule],
  controllers: [GetLabController],
  providers: [GetLabHandler],
  exports: [GetLabHandler],
})
export class GetLabModule {}
