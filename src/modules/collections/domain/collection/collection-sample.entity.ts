import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { TubeTypeEnum } from './enums/tube-type.enum';
import type { CollectionRequest } from './collection-request.entity';

@Entity('collection_samples')
@Index(['collectionRequestId'])
@Index(['barcode'])
export class CollectionSample extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'collection_request_id' })
  collectionRequestId: string;

  @ManyToOne('CollectionRequest', (cr: any) => cr.samples, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_request_id' })
  collectionRequest: CollectionRequest;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'tube_type',
    default: TubeTypeEnum.EDTA,
  })
  tubeType: TubeTypeEnum;

  @Column({ type: 'varchar', length: 100 })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
