import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { CreateLabController } from './create-lab.controller';
import { CreateLabHandler } from './create-lab.handler';

@Module({
  imports: [LabsDatabaseModule],
  controllers: [CreateLabController],
  providers: [CreateLabHandler],
  exports: [CreateLabHandler],
})
export class CreateLabModule {}
