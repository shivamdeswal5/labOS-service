import { TenantSubscription } from '../../domain/entities/tenant-subscription.entity';
import { SubscriptionStatusEnum } from '../../domain/enums/platform-billing.enums';

export class TenantSubscriptionResponseDto {
  subscription: TenantSubscription | null;
  isTrialing: boolean;
  isActive: boolean;
  isGracePeriod: boolean;
  isLocked: boolean;

  static from(subscription: TenantSubscription | null): TenantSubscriptionResponseDto {
    const dto = new TenantSubscriptionResponseDto();
    dto.subscription = subscription;
    dto.isTrialing = subscription?.status === SubscriptionStatusEnum.TRIALING;
    dto.isActive = subscription?.status === SubscriptionStatusEnum.ACTIVE;
    dto.isGracePeriod = subscription?.status === SubscriptionStatusEnum.GRACE_PERIOD;
    dto.isLocked = subscription?.status === SubscriptionStatusEnum.LOCKED;
    return dto;
  }
}
