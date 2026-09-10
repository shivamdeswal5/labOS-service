import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { PackagePanel } from './package-panel.entity';

@Entity('test_packages')
export class TestPackage extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @OneToMany(() => PackagePanel, (packagePanel) => packagePanel.testPackage, {
    cascade: true,
    eager: true,
  })
  packagePanels: PackagePanel[];
}
