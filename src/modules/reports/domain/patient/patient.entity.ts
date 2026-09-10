import {
  Entity,
  Column,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { SexEnum, SexEnumMapper } from 'src/modules/shared/domain/enums/sex.enum';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import { Report } from '../report/report.entity';

@Entity('patients')
@Index(['labId', 'patientNumber'], { unique: true })
@Index(['labId', 'phone'])
@Index(['labId', 'name'])
export class Patient extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'varchar', length: 50, name: 'patient_number' })
  patientNumber: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  age: string | null;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth: Date | null;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(SexEnumMapper, SexEnum),
    default: 0,
  })
  sex: SexEnum;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Report, (report) => report.patient)
  reports: Report[];
}
