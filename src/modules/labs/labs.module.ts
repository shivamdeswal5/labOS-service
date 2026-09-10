import { Module } from '@nestjs/common';
import { LabsDatabaseModule } from './infrastructure/database/labs-database.module';
import { LabFeatureModule } from './features/lab/lab-feature.module';
import { ProfileFeatureModule } from './features/profile/profile-feature.module';

@Module({
  imports: [
    LabsDatabaseModule,
    LabFeatureModule,
    ProfileFeatureModule,
  ],
  exports: [
    LabsDatabaseModule,
    LabFeatureModule,
    ProfileFeatureModule,
  ],
})
export class LabsModule {}
