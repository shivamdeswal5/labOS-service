import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { SexEnum, SexEnumMapper } from 'src/modules/shared/domain/enums/sex.enum';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import {
  CollectionStatusEnum,
  CollectionStatusEnumMapper,
} from './enums/collection-status.enum';
import { CollectionSample } from './collection-sample.entity';

@Entity('collection_requests')
@Index(['labId', 'requestNumber'], { unique: true })
@Index(['labId', 'preferredDate'])
@Index(['labId', 'status'])
@Index(['labId', 'assignedPhlebotomistId'])
export class CollectionRequest extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'varchar', length: 50, name: 'request_number' })
  requestNumber: string;

  @Column({ type: 'uuid', name: 'patient_id', nullable: true })
  patientId: string | null;

  @Column({ type: 'text', name: 'patient_name' })
  patientName: string;

  @Column({ type: 'varchar', length: 20, name: 'patient_phone' })
  patientPhone: string;

  @Column({ type: 'text', name: 'patient_age', nullable: true })
  patientAge: string | null;

  @Column({
    type: 'smallint',
    name: 'patient_sex',
    transformer: createEnumTransformer(SexEnumMapper, SexEnum),
    default: 0,
  })
  patientSex: SexEnum;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'date', name: 'preferred_date' })
  preferredDate: Date;

  @Column({ type: 'varchar', length: 50, name: 'time_slot' })
  timeSlot: string;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(
      CollectionStatusEnumMapper,
      CollectionStatusEnum,
    ),
    default: 0,
  })
  status: CollectionStatusEnum;

  @Column({
    type: 'uuid',
    name: 'assigned_phlebotomist_id',
    nullable: true,
  })
  assignedPhlebotomistId: string | null;

  @Column({
    type: 'text',
    name: 'assigned_phlebotomist_name',
    nullable: true,
  })
  assignedPhlebotomistName: string | null;

  @Column({
    type: 'boolean',
    name: 'is_fasting_required',
    default: false,
  })
  isFastingRequired: boolean;

  @Column({
    type: 'jsonb',
    name: 'test_names',
    default: '[]',
  })
  testNames: string[];

  @Column({ type: 'text', name: 'special_instructions', nullable: true })
  specialInstructions: string | null;

  @Column({ type: 'text', name: 'cancellation_reason', nullable: true })
  cancellationReason: string | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'collected_at',
    nullable: true,
  })
  collectedAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'delivered_to_lab_at',
    nullable: true,
  })
  deliveredToLabAt: Date | null;

  @Column({ type: 'uuid', name: 'report_id', nullable: true })
  reportId: string | null;

  @OneToMany(() => CollectionSample, (sample) => sample.collectionRequest, {
    cascade: true,
    eager: true,
  })
  samples: CollectionSample[];
}
