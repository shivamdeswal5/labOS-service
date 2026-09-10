import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { UpdateLabController } from './update-lab.controller';
import { UpdateLabHandler } from './update-lab.handler';

@Module({
  imports: [LabsDatabaseModule],
  controllers: [UpdateLabController],
  providers: [UpdateLabHandler],
  exports: [UpdateLabHandler],
})
export class UpdateLabModule {}
