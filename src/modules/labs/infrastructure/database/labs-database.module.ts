import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import {
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import {
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';
import { LabRepository } from './repositories/lab.repository';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Lab, Profile])],
  providers: [
    {
      provide: LAB_REPOSITORY_TOKEN,
      useClass: LabRepository,
    },
    {
      provide: PROFILE_REPOSITORY_TOKEN,
      useClass: ProfileRepository,
    },
  ],
  exports: [LAB_REPOSITORY_TOKEN, PROFILE_REPOSITORY_TOKEN],
})
export class LabsDatabaseModule {}
