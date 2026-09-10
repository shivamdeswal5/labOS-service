import { Entity, Column, Index } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { createEnumTransformer } from 'src/modules/shared/infrastructure/database/transformers/enum.transformer';
import {
  ExpenseCategoryEnum,
  ExpenseCategoryEnumMapper,
} from './enums/expense-category.enum';
import {
  PaymentMethodEnum,
  PaymentMethodEnumMapper,
} from '../invoice/enums/payment-method.enum';

@Entity('expenses')
@Index(['labId', 'expenseDate'])
@Index(['labId', 'category'])
export class Expense extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({
    type: 'smallint',
    transformer: createEnumTransformer(
      ExpenseCategoryEnumMapper,
      ExpenseCategoryEnum,
    ),
  })
  category: ExpenseCategoryEnum;

  @Column({ type: 'text' })
  title: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({ type: 'date', name: 'expense_date' })
  expenseDate: Date;

  @Column({
    type: 'smallint',
    name: 'payment_method',
    transformer: createEnumTransformer(PaymentMethodEnumMapper, PaymentMethodEnum),
    default: 0,
  })
  paymentMethod: PaymentMethodEnum;

  @Column({ type: 'text', nullable: true })
  vendor: string | null;

  @Column({ type: 'varchar', length: 100, name: 'vendor_invoice_number', nullable: true })
  vendorInvoiceNumber: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
