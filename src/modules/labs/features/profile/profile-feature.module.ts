import { Module } from '@nestjs/common';
import { GetProfileModule } from './get-profile/get-profile.module';
import { UpdateProfileModule } from './update-profile/update-profile.module';
import { AddMemberModule } from './add-member/add-member.module';
import { ListMembersModule } from './list-members/list-members.module';

@Module({
  imports: [GetProfileModule, UpdateProfileModule, AddMemberModule, ListMembersModule],
  exports: [GetProfileModule, UpdateProfileModule, AddMemberModule, ListMembersModule],
})
export class ProfileFeatureModule {}
