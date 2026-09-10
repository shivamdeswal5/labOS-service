import { Inject, Injectable } from '@nestjs/common';
import { CreatePackageCommand } from './create-package.command';
import { TestPackage } from 'src/modules/panels/domain/package/test-package.entity';
import {
  IPackageRepository,
  PACKAGE_REPOSITORY_TOKEN,
} from 'src/modules/panels/domain/package/interfaces/package.repository.interface';

@Injectable()
export class CreatePackageHandler {
  constructor(
    @Inject(PACKAGE_REPOSITORY_TOKEN)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async execute(command: CreatePackageCommand): Promise<TestPackage> {
    const { labId, dto } = command;

    return this.packageRepository.createWithPanels(
      {
        labId,
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
      },
      dto.panelIds,
    );
  }
}
