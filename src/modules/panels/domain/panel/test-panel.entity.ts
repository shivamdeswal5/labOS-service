import {
  Entity,
  Column,
  OneToMany,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { PanelSection } from './panel-section.entity';

@Entity('test_panels')
@Index(['labId', 'category'])
@Index(['labId', 'name'])
export class TestPanel extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'integer', name: 'sort_order', default: 0 })
  sortOrder: number;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => PanelSection, (section) => section.panel, {
    cascade: true,
    eager: true,
  })
  sections: PanelSection[];
}
