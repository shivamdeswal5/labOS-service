import { Module } from '@nestjs/common';
import { CreateLabModule } from './create-lab/create-lab.module';
import { UpdateLabModule } from './update-lab/update-lab.module';
import { GetLabModule } from './get-lab/get-lab.module';

@Module({
  imports: [CreateLabModule, UpdateLabModule, GetLabModule],
  exports: [CreateLabModule, UpdateLabModule, GetLabModule],
})
export class LabFeatureModule {}
