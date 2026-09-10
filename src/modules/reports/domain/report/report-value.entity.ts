import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  BaseEntity,
} from 'typeorm';
import { Report } from './report.entity';
import { PanelParameter } from 'src/modules/panels/domain/panel/panel-parameter.entity';

@Entity('report_values')
@Index(['reportId', 'parameterId'], { unique: true })
export class ReportValue extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'report_id' })
  reportId: string;

  @ManyToOne(() => Report, (report) => report.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ type: 'uuid', name: 'parameter_id' })
  parameterId: string;

  @ManyToOne(() => PanelParameter, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parameter_id' })
  parameter: PanelParameter;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'boolean', name: 'is_out_of_range', default: false })
  isOutOfRange: boolean;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;
}
