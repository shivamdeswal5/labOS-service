import { Entity, Column, OneToMany } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { Profile } from '../profile/profile.entity';
import { ReportLanguageEnum } from './enums/report-language.enum';

@Entity('labs')
export class Lab extends BaseDomainEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', array: true, default: '{}' })
  phoneNumbers: string[];

  @Column({ type: 'text', name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 10, name: 'accent_color', default: '#0f172a' })
  accentColor: string;

  @Column({ type: 'text', nullable: true })
  tagline: string | null;

  @Column({
    type: 'text',
    name: 'footer_note',
    nullable: true,
    default: 'NOT VALID FOR MEDICO LEGAL PURPOSE',
  })
  footerNote: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    name: 'report_language',
    default: ReportLanguageEnum.EN,
  })
  reportLanguage: ReportLanguageEnum;

  @OneToMany(() => Profile, (profile) => profile.lab)
  profiles: Profile[];
}
