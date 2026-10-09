import { Entity, Column } from 'typeorm';
import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';
import { PlanSlugEnum } from '../enums/platform-billing.enums';

@Entity('platform_plans')
export class PlatformPlan extends BaseDomainEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  slug: PlanSlugEnum;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', name: 'monthly_price_inr' })
  monthlyPriceInr: number;

  @Column({ type: 'integer', name: 'yearly_price_inr' })
  yearlyPriceInr: number;

  @Column({ type: 'jsonb', default: '{}', name: 'feature_entitlements' })
  featureEntitlements: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_public' })
  isPublic: boolean;
}
