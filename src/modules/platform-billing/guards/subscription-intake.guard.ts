import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../domain/subscription/interfaces/subscription-repository.interface';
import { SubscriptionStatusEnum } from '../domain/enums/platform-billing.enums';

@Injectable()
export class SubscriptionIntakeGuard implements CanActivate {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const labId = request.user?.labId;

    if (!labId) {
      return true;
    }

    const subscription = await this.subRepo.findByLabId(labId);
    if (!subscription) {
      // If no subscription row exists, JIT will handle it, do not lock
      return true;
    }

    if (
      subscription.status === SubscriptionStatusEnum.LOCKED ||
      subscription.status === SubscriptionStatusEnum.SUSPENDED
    ) {
      throw new ForbiddenException({
        code: 'SUBSCRIPTION_INTAKE_LOCKED',
        message:
          'Laboratory subscription is locked or suspended. Please activate or upgrade your subscription to register new patient accessions.',
        status: subscription.status,
      });
    }

    return true;
  }
}
