import { Controller, Get, Req, BadRequestException } from '@nestjs/common';
import { GetTenantSubscriptionHandler } from './get-tenant-subscription.handler';
import { GetTenantSubscriptionQuery } from './get-tenant-subscription.query';

@Controller('billing/subscription')
export class GetTenantSubscriptionController {
  constructor(private readonly handler: GetTenantSubscriptionHandler) {}

  @Get()
  async getSubscription(@Req() req: any) {
    const labId = req.user?.labId;
    if (!labId) {
      throw new BadRequestException('User is not associated with an active laboratory');
    }
    return this.handler.execute(new GetTenantSubscriptionQuery(labId));
  }
}
