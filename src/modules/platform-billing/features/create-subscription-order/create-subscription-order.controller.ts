import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { CreateSubscriptionOrderHandler } from './create-subscription-order.handler';
import { CreateSubscriptionOrderCommand } from './create-subscription-order.command';
import { CreateSubscriptionOrderDto } from './create-subscription-order.dto';

@Controller('billing/orders')
export class CreateSubscriptionOrderController {
  constructor(private readonly handler: CreateSubscriptionOrderHandler) {}

  @Post()
  async createOrder(@Req() req: any, @Body() dto: CreateSubscriptionOrderDto) {
    const labId = req.user?.labId;
    if (!labId) {
      throw new BadRequestException('User is not associated with an active laboratory');
    }

    return this.handler.execute(new CreateSubscriptionOrderCommand(labId, dto));
  }
}
