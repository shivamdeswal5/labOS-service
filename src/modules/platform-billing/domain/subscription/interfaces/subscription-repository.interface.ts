import { TenantSubscription } from '../../entities/tenant-subscription.entity';

export interface ISubscriptionRepository {
  findByLabId(labId: string): Promise<TenantSubscription | null>;
  findWithLock(labId: string): Promise<TenantSubscription | null>;
  findAll(): Promise<TenantSubscription[]>;
  save(subscription: TenantSubscription): Promise<TenantSubscription>;
  create(data: Partial<TenantSubscription>): TenantSubscription;
}

export const SUBSCRIPTION_REPOSITORY_TOKEN = Symbol('ISubscriptionRepository');
