import { TestPackage } from '../test-package.entity';

export const PACKAGE_REPOSITORY_TOKEN = Symbol('IPackageRepository');

export interface IPackageRepository {
  findById(id: string, labId: string): Promise<TestPackage | null>;
  findByLabId(labId: string): Promise<TestPackage[]>;
  createWithPanels(packageData: Partial<TestPackage>, panelIds: string[]): Promise<TestPackage>;
}
