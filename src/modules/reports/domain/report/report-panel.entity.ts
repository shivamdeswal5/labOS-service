import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Report } from './report.entity';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';

@Entity('report_panels')
export class ReportPanel extends BaseEntity {
  @PrimaryColumn('uuid', { name: 'report_id' })
  reportId: string;

  @ManyToOne(() => Report, (report) => report.reportPanels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @PrimaryColumn('uuid', { name: 'panel_id' })
  panelId: string;

  @ManyToOne(() => TestPanel, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'panel_id' })
  panel: TestPanel;
}
