import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { PlatformPayment } from './platform-payment.entity';

@Entity('subscription_invoices')
export class SubscriptionInvoice extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'invoice_number' })
  invoiceNumber: string;

  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'uuid', name: 'payment_id' })
  paymentId: string;

  @ManyToOne(() => PlatformPayment, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payment_id' })
  payment: PlatformPayment;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'amount_inr' })
  amountInr: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, name: 'tax_amount_inr' })
  taxAmountInr: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'subtotal_inr' })
  subtotalInr: number;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'customer_gstin' })
  customerGstin: string | null;

  @Column({ type: 'timestamptz', name: 'billing_period_start' })
  billingPeriodStart: Date;

  @Column({ type: 'timestamptz', name: 'billing_period_end' })
  billingPeriodEnd: Date;

  @Column({ type: 'text', nullable: true, name: 'pdf_url' })
  pdfUrl: string | null;

  @Column({ type: 'varchar', length: 30, default: 'PAID' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
