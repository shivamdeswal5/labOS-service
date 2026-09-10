import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Lab } from '../lab/lab.entity';
import { RoleEnum, RoleEnumMapper } from './enums/role.enum';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';

@Entity('profiles')
export class Profile extends BaseEntity {
  
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @ManyToOne(() => Lab, (lab) => lab.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lab_id' })
  lab: Lab;

  @Column({ type: 'text', name: 'full_name' })
  fullName: string;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(RoleEnumMapper, RoleEnum),
    default: 1,
  })
  role: RoleEnum;

  @Column({ type: 'text', name: 'signature_url', nullable: true })
  signatureUrl: string | null;

  @Column({ type: 'text', nullable: true })
  qualification: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
