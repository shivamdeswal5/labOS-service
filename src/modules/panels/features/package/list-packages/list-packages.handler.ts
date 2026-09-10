import { Inject, Injectable } from '@nestjs/common';
import { ListPackagesQuery } from './list-packages.query';
import { TestPackage } from 'src/modules/panels/domain/package/test-package.entity';
import {
  IPackageRepository,
  PACKAGE_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/package/interfaces/package.repository.interface';

@Injectable()
export class ListPackagesHandler {
  constructor(
    @Inject(PACKAGE_REPOSITORY_TOKEN)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async execute(query: ListPackagesQuery): Promise<TestPackage[]> {
    return this.packageRepository.findByLabId(query.labId);
  }
}
