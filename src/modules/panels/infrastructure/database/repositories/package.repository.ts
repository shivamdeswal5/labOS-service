import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { TestPackage } from 'src/modules/panels/domain/package/test-package.entity';
import { PackagePanel } from 'src/modules/panels/domain/package/package-panel.entity';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import { IPackageRepository } from 'src/modules/panels/domain/package/interfaces/package.repository.interface';
import { DomainValidationException } from 'src/modules/shared/domain/exceptions/domain-validation.exception';

@Injectable()
export class PackageRepository implements IPackageRepository {
  constructor(
    @InjectRepository(TestPackage)
    private readonly packageRepo: Repository<TestPackage>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string, labId: string): Promise<TestPackage | null> {
    return this.packageRepo.findOne({
      where: { id, labId },
      relations: {
        packagePanels: {
          testPanel: {
            sections: {
              parameters: true,
            },
          },
        },
      },
    });
  }

  async findByLabId(labId: string): Promise<TestPackage[]> {
    return this.packageRepo.find({
      where: { labId },
      relations: {
        packagePanels: {
          testPanel: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createWithPanels(
    packageData: Partial<TestPackage>,
    panelIds: string[],
  ): Promise<TestPackage> {
    return this.dataSource.transaction(async (manager) => {
      const validPanels = await manager.find(TestPanel, {
        where: { id: In(panelIds), labId: packageData.labId },
      });

      if (validPanels.length !== panelIds.length) {
        throw new DomainValidationException('One or more panel IDs are invalid or belong to another lab');
      }

      const pkg = manager.create(TestPackage, {
        labId: packageData.labId,
        name: packageData.name,
        description: packageData.description ?? null,
        price: packageData.price ?? 0,
      });

      const savedPackage = await manager.save(pkg);

      for (let i = 0; i < validPanels.length; i++) {
        const packagePanel = manager.create(PackagePanel, {
          packageId: savedPackage.id,
          panelId: validPanels[i].id,
          sortOrder: i + 1,
        });
        await manager.save(packagePanel);
      }

      return manager.findOneOrFail(TestPackage, {
        where: { id: savedPackage.id },
        relations: {
          packagePanels: {
            testPanel: true,
          },
        },
      });
    });
  }
}
