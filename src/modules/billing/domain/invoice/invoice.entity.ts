import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import {
  PaymentStatusEnum,
  PaymentStatusEnumMapper,
} from './enums/payment-status.enum';
import {
  PaymentMethodEnum,
  PaymentMethodEnumMapper,
} from './enums/payment-method.enum';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
@Index(['labId', 'invoiceNumber'], { unique: true })
@Index(['labId', 'patientId'])
@Index(['labId', 'reportId'])
@Index(['labId', 'paymentStatus'])
export class Invoice extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @Column({ type: 'uuid', name: 'report_id', nullable: true })
  reportId: string | null;

  @Column({ type: 'varchar', length: 50, name: 'invoice_number' })
  invoiceNumber: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'total_amount',
    default: 0,
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'paid_amount',
    default: 0,
  })
  paidAmount: number;

  @Column({
    type: 'smallint',
    name: 'payment_status',
    transformer: createEnumTransformer(PaymentStatusEnumMapper, PaymentStatusEnum),
    default: 0,
  })
  paymentStatus: PaymentStatusEnum;

  @Column({
    type: 'smallint',
    name: 'payment_method',
    transformer: createEnumTransformer(PaymentMethodEnumMapper, PaymentMethodEnum),
    nullable: true,
  })
  paymentMethod: PaymentMethodEnum | null;

  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
