import { Module } from '@nestjs/common';
import { CreatePackageModule } from './create-package/create-package.module';
import { ListPackagesModule } from './list-packages/list-packages.module';

@Module({
  imports: [CreatePackageModule, ListPackagesModule],
  exports: [CreatePackageModule, ListPackagesModule],
})
export class PackageFeatureModule {}
