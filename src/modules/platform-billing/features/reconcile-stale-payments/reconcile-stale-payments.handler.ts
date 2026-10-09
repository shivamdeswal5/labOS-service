import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReconcileStalePaymentsCommand } from './reconcile-stale-payments.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/payment/interfaces/payment-repository.interface';
import { RazorpayGatewayAdapter } from '../../infrastructure/adapters/razorpay.adapter';
import { HandleRazorpayWebhookHandler } from '../handle-razorpay-webhook/handle-razorpay-webhook.handler';
import { PaymentStatusEnum } from '../../domain/enums/platform-billing.enums';

@Injectable()
export class ReconcileStalePaymentsHandler {
  private readonly logger = new Logger(ReconcileStalePaymentsHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
    private readonly razorpayAdapter: RazorpayGatewayAdapter,
    private readonly webhookHandler: HandleRazorpayWebhookHandler,
  ) {}

  async execute(_command?: ReconcileStalePaymentsCommand): Promise<{ reconciledCount: number }> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stalePayments = await this.paymentRepo.findStalePending(
      fifteenMinutesAgo,
      twentyFourHoursAgo,
    );

    let reconciledCount = 0;

    for (const payment of stalePayments) {
      if (!payment.providerOrderId) {
        continue;
      }

      try {
        const gatewayStatus = await this.razorpayAdapter.fetchPaymentStatus(
          payment.providerOrderId,
        );

        if (gatewayStatus && gatewayStatus.status === PaymentStatusEnum.SUCCESS) {
          this.logger.log(
            `Safety-Net Cron: Self-healing activation for stale order ${payment.providerOrderId}`,
          );
          await this.webhookHandler.activateSubscriptionFromPayment({
            providerOrderId: payment.providerOrderId,
            providerPaymentId: gatewayStatus.providerPaymentId,
            amountInPaise: gatewayStatus.amountInPaise,
            paymentMethod: gatewayStatus.paymentMethod,
          });
          reconciledCount++;
        } else if (gatewayStatus && gatewayStatus.status === PaymentStatusEnum.FAILED) {
          payment.status = PaymentStatusEnum.EXPIRED;
          await this.paymentRepo.save(payment);
        }
      } catch (err: any) {
        this.logger.warn(
          `Safety-Net Cron error checking payment ${payment.providerOrderId}: ${err.message}`,
        );
      }
    }

    return { reconciledCount };
  }
}
