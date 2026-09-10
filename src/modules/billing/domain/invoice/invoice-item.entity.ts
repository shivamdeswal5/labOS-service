import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
@Index(['invoiceId'])
export class InvoiceItem extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'invoice_id' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'unit_price',
    default: 0,
  })
  unitPrice: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  total: number;
}
