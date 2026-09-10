import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

export interface TemplateSection {
  name: string;
  sortOrder: number;
  parameters: Array<{
    name: string;
    nameLocal?: string;
    unit?: string;
    inputType: string;
    options?: string[];
    method?: string;
    normalRange?: any;
    sortOrder: number;
  }>;
}

@Entity('panel_templates')
export class PanelTemplate extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  defaultPrice: number;

  @Column({ type: 'jsonb', name: 'template_data' })
  templateData: {
    sections: TemplateSection[];
  };
}
