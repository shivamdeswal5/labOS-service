import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { TestPanel } from './test-panel.entity';
import { PanelParameter } from './panel-parameter.entity';

@Entity('panel_sections')
export class PanelSection extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'panel_id' })
  panelId: string;

  @ManyToOne(() => TestPanel, (panel) => panel.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panel_id' })
  panel: TestPanel;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'integer', name: 'sort_order', default: 0 })
  sortOrder: number;

  @OneToMany(() => PanelParameter, (parameter) => parameter.section, {
    cascade: true,
    eager: true,
  })
  parameters: PanelParameter[];
}
