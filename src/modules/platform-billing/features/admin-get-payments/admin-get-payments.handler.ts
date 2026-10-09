import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/payment/interfaces/payment-repository.interface';
import { AdminGetPaymentsQuery } from './admin-get-payments.query';
import { AdminGetPaymentsResponseDto } from './admin-payment-list-item.dto';

@Injectable()
export class AdminGetPaymentsHandler {
  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(query: AdminGetPaymentsQuery): Promise<AdminGetPaymentsResponseDto> {
    const { items, total } = await this.paymentRepo.findAll(query.limit, query.offset);

    return {
      total,
      items: items.map((p) => ({
        id: p.id,
        labId: p.labId,
        provider: p.provider,
        method: p.paymentMethod,
        amountInr: p.amountInPaise / 100,
        currency: p.currency,
        status: p.status,
        providerPaymentId: p.providerPaymentId,
        providerOrderId: p.providerOrderId,
        planName: p.subscription?.plan?.name || null,
        billingCycle: p.subscription?.billingCycle || null,
        createdAt: new Date(p.createdAt).toISOString(),
        details: p.paymentDetails || {},
      })),
    };
  }
}
