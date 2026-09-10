import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import {
  CommissionStatusEnum,
  CommissionStatusEnumMapper,
} from './enums/commission-status.enum';
import { ReferringDoctor } from '../doctor/referring-doctor.entity';

@Entity('doctor_commission_ledger')
@Index(['labId', 'doctorId'])
@Index(['labId', 'status'])
@Index(['labId', 'reportId'])
export class DoctorCommissionLedger extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'uuid', name: 'doctor_id' })
  doctorId: string;

  @ManyToOne(() => ReferringDoctor, (doctor) => doctor.commissionLedgers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: ReferringDoctor;

  @Column({ type: 'uuid', name: 'report_id', nullable: true })
  reportId: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(CommissionStatusEnumMapper, CommissionStatusEnum),
    default: 0,
  })
  status: CommissionStatusEnum;

  @Column({ type: 'timestamptz', name: 'settled_at', nullable: true })
  settledAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
