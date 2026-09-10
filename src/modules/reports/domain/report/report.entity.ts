import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import {
  ReportStatusEnum,
  ReportStatusEnumMapper,
} from './enums/report-status.enum';
import {
  SampleStatusEnum,
  SampleStatusEnumMapper,
} from './enums/sample-status.enum';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import { Patient } from '../patient/patient.entity';
import { ReportValue } from './report-value.entity';
import { ReportAmendment } from './report-amendment.entity';
import { ReportPanel } from './report-panel.entity';

@Entity('reports')
@Index(['labId', 'reportNumber'], { unique: true })
@Index(['labId', 'patientId'])
@Index(['labId', 'status'])
@Index(['shareToken'], { unique: true })
export class Report extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.reports, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'varchar', length: 50, name: 'report_number' })
  reportNumber: string;

  @Column({ type: 'uuid', name: 'ref_by_doctor_id', nullable: true })
  refByDoctorId: string | null;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(ReportStatusEnumMapper, ReportStatusEnum),
    default: 0,
  })
  status: ReportStatusEnum;

  @Column({
    type: 'smallint',
    name: 'sample_status',
    transformer: createEnumTransformer(SampleStatusEnumMapper, SampleStatusEnum),
    default: 0,
  })
  sampleStatus: SampleStatusEnum;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'timestamptz', name: 'sample_collected_at', nullable: true })
  sampleCollectedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'results_entered_at', nullable: true })
  resultsEnteredAt: Date | null;

  @Column({ type: 'timestamptz', name: 'finalized_at', nullable: true })
  finalizedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'delivered_at', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @Column({ type: 'varchar', length: 64, name: 'share_token', unique: true })
  shareToken: string;

  @Column({ type: 'timestamptz', name: 'share_expires_at', nullable: true })
  shareExpiresAt: Date | null;

  @Column({ type: 'text', name: 'pdf_url', nullable: true })
  pdfUrl: string | null;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ReportPanel, (rp) => rp.report, { cascade: true, eager: true })
  reportPanels: ReportPanel[];

  @OneToMany(() => ReportValue, (rv) => rv.report, { cascade: true, eager: true })
  values: ReportValue[];

  @OneToMany(() => ReportAmendment, (amendment) => amendment.report)
  amendments: ReportAmendment[];
}
