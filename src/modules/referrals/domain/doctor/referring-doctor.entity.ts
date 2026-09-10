import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import {
  CommissionTypeEnum,
  CommissionTypeEnumMapper,
} from './enums/commission-type.enum';
import { DoctorCommissionLedger } from '../commission/doctor-commission-ledger.entity';

@Entity('referring_doctors')
@Index(['labId', 'name'])
@Index(['labId', 'phone'])
export class ReferringDoctor extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  clinic: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({
    type: 'smallint',
    name: 'commission_type',
    transformer: createEnumTransformer(CommissionTypeEnumMapper, CommissionTypeEnum),
    default: 0,
  })
  commissionType: CommissionTypeEnum;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'commission_value',
    default: 0,
  })
  commissionValue: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => DoctorCommissionLedger, (ledger) => ledger.doctor)
  commissionLedgers: DoctorCommissionLedger[];
}
