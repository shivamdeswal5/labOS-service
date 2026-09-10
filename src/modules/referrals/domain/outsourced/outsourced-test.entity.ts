import { Entity, Column, Index } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import {
  OutsourcedTestStatusEnum,
  OutsourcedTestStatusEnumMapper,
} from './enums/outsourced-test-status.enum';

@Entity('outsourced_tests')
@Index(['labId', 'reportId'])
@Index(['labId', 'status'])
@Index(['labId', 'referenceLabName'])
export class OutsourcedTest extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'uuid', name: 'report_id' })
  reportId: string;

  @Column({ type: 'text', name: 'test_name' })
  testName: string;

  @Column({ type: 'text', name: 'reference_lab_name' })
  referenceLabName: string;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(
      OutsourcedTestStatusEnumMapper,
      OutsourcedTestStatusEnum,
    ),
    default: 0,
  })
  status: OutsourcedTestStatusEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cost: number | null;

  @Column({ type: 'timestamptz', name: 'sent_at', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'timestamptz', name: 'received_at', nullable: true })
  receivedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
