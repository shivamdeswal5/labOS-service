import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Report } from './report.entity';

@Entity('report_amendments')
export class ReportAmendment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'report_id' })
  reportId: string;

  @ManyToOne(() => Report, (report) => report.amendments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ type: 'uuid', name: 'amended_by' })
  amendedBy: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'jsonb', name: 'previous_data' })
  previousData: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
