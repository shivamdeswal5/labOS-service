import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { PlatformPlan } from './platform-plan.entity';
import { SubscriptionStatusEnum, BillingCycleEnum } from '../enums/platform-billing.enums';

@Entity('tenant_subscriptions')
export class TenantSubscription extends BaseDomainEntity {
  @Column({ type: 'uuid', unique: true, name: 'lab_id' })
  labId: string;

  @Column({ type: 'uuid', name: 'plan_id' })
  planId: string;

  @ManyToOne(() => PlatformPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan;

  @Column({
    type: 'varchar',
    length: 30,
    default: SubscriptionStatusEnum.TRIALING,
  })
  status: SubscriptionStatusEnum;

  @Column({
    type: 'varchar',
    length: 20,
    default: BillingCycleEnum.MONTHLY,
    name: 'billing_cycle',
  })
  billingCycle: BillingCycleEnum;

  @Column({ type: 'timestamptz', name: 'trial_start' })
  trialStart: Date;

  @Column({ type: 'timestamptz', name: 'trial_end' })
  trialEnd: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'current_period_start' })
  currentPeriodStart: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'current_period_end' })
  currentPeriodEnd: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'grace_period_end' })
  gracePeriodEnd: Date | null;

  @Column({
    type: 'jsonb',
    default: '{}',
    nullable: true,
    name: 'custom_entitlement_overrides',
  })
  customEntitlementOverrides: Record<string, any> | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'canceled_at' })
  canceledAt: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'scheduled_plan_id' })
  scheduledPlanId: string | null;

  @ManyToOne(() => PlatformPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scheduled_plan_id' })
  scheduledPlan: PlatformPlan | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'scheduled_billing_cycle',
  })
  scheduledBillingCycle: BillingCycleEnum | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'scheduled_at' })
  scheduledAt: Date | null;

  @Column({ type: 'varchar', length: 15, nullable: true, name: 'customer_gstin' })
  customerGstin: string | null;
}
