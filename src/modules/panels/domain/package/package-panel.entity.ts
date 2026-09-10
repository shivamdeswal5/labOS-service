import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { TestPackage } from './test-package.entity';
import { TestPanel } from '../panel/test-panel.entity';

@Entity('package_panels')
export class PackagePanel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'package_id' })
  packageId: string;

  @ManyToOne(() => TestPackage, (pkg) => pkg.packagePanels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  testPackage: TestPackage;

  @Column({ type: 'uuid', name: 'panel_id' })
  panelId: string;

  @Column({ type: 'integer', name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => TestPanel, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panel_id' })
  testPanel: TestPanel;
}
