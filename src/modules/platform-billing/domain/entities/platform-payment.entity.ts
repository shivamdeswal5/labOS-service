import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { TenantSubscription } from './tenant-subscription.entity';
import { PaymentStatusEnum, PaymentProviderEnum } from '../enums/platform-billing.enums';

@Entity('platform_payments')
export class PlatformPayment extends BaseDomainEntity {
  @Column({ type: 'uuid', name: 'lab_id' })
  labId: string;

  @Column({ type: 'uuid', nullable: true, name: 'subscription_id' })
  subscriptionId: string | null;

  @ManyToOne(() => TenantSubscription, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription: TenantSubscription | null;

  @Column({ type: 'varchar', length: 30 })
  provider: PaymentProviderEnum;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'provider_order_id' })
  providerOrderId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'provider_payment_id' })
  providerPaymentId: string | null;

  @Column({ type: 'integer', name: 'amount_in_paise' })
  amountInPaise: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'payment_method' })
  paymentMethod: string | null;

  @Column({ type: 'jsonb', default: '{}', name: 'payment_details' })
  paymentDetails: Record<string, any>;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true, name: 'idempotency_key' })
  idempotencyKey: string | null;

  @Column({ type: 'text', nullable: true, name: 'failure_reason' })
  failureReason: string | null;
}
