import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { GetProfileController } from './get-profile.controller';
import { GetProfileHandler } from './get-profile.handler';

@Module({
  imports: [LabsDatabaseModule],
  controllers: [GetProfileController],
  providers: [GetProfileHandler],
  exports: [GetProfileHandler],
})
export class GetProfileModule {}
