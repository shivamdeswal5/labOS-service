import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { PanelSection } from './panel-section.entity';
import {
  ParameterInputTypeEnum,
  ParameterInputTypeEnumMapper,
} from './enums/parameter-input-type.enum';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import { type StructuredNormalRange } from './value-objects/normal-range.value-object';

@Entity('panel_parameters')
export class PanelParameter extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'section_id' })
  sectionId: string;

  @ManyToOne(() => PanelSection, (section) => section.parameters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: PanelSection;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', name: 'name_local', nullable: true })
  nameLocal: string | null;

  @Column({ type: 'text', nullable: true })
  unit: string | null;

  @Column({
    type: 'smallint',
    name: 'input_type',
    transformer: createEnumTransformer(
      ParameterInputTypeEnumMapper,
      ParameterInputTypeEnum,
    ),
    default: 1,
  })
  inputType: ParameterInputTypeEnum;

  @Column({ type: 'jsonb', nullable: true })
  options: string[] | null;

  @Column({ type: 'text', nullable: true })
  method: string | null;

  @Column({ type: 'jsonb', name: 'normal_range', nullable: true })
  normalRange: StructuredNormalRange | null;

  @Column({ type: 'integer', name: 'sort_order', default: 0 })
  sortOrder: number;
}
