import { Module } from '@nestjs/common';
import { GetProfileModule } from './get-profile/get-profile.module';
import { UpdateProfileModule } from './update-profile/update-profile.module';
import { AddMemberModule } from './add-member/add-member.module';

@Module({
  imports: [GetProfileModule, UpdateProfileModule, AddMemberModule],
  exports: [GetProfileModule, UpdateProfileModule, AddMemberModule],
})
export class ProfileFeatureModule {}
