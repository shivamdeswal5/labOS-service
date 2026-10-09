import { CreateSubscriptionOrderDto } from './create-subscription-order.dto';

export class CreateSubscriptionOrderCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreateSubscriptionOrderDto,
  ) {}
}
