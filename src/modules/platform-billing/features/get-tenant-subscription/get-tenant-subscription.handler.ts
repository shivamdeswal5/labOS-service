import { Inject, Injectable } from '@nestjs/common';
import { GetTenantSubscriptionQuery } from './get-tenant-subscription.query';
import { TenantSubscriptionResponseDto } from './get-tenant-subscription.dto';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';

@Injectable()
export class GetTenantSubscriptionHandler {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
  ) {}

  async execute(query: GetTenantSubscriptionQuery): Promise<TenantSubscriptionResponseDto> {
    const subscription = await this.subRepo.findByLabId(query.labId);
    return TenantSubscriptionResponseDto.from(subscription);
  }
}
