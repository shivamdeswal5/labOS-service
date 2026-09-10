import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { UpdateProfileController } from './update-profile.controller';
import { UpdateProfileHandler } from './update-profile.handler';

@Module({
  imports: [LabsDatabaseModule],
  controllers: [UpdateProfileController],
  providers: [UpdateProfileHandler],
  exports: [UpdateProfileHandler],
})
export class UpdateProfileModule {}
