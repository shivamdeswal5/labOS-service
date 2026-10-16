import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  IPaymentGatewayPort,
  CreateGatewayOrderInput,
  GatewayOrderResult,
  NormalizedWebhookEvent,
  GatewayPaymentStatusResult,
} from '../../domain/ports/payment-gateway.port';
import { PaymentProviderEnum, PaymentStatusEnum } from '../../domain/enums/platform-billing.enums';

@Injectable()
export class RazorpayGatewayAdapter implements IPaymentGatewayPort {
  private readonly logger = new Logger(RazorpayGatewayAdapter.name);
  readonly provider = PaymentProviderEnum.RAZORPAY;
  private readonly razorpay: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_placeholder');
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET', 'test_secret_placeholder');
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET', 'test_webhook_secret');

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult> {
    const isPlaceholder =
      !this.keySecret ||
      this.keySecret === 'test_secret_placeholder' ||
      this.keyId === 'rzp_test_placeholder';

    if (isPlaceholder) {
      this.logger.warn(
        'RAZORPAY_KEY_ID is not configured with live credentials. Generating sandbox simulation order.',
      );
      return {
        providerOrderId: `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        provider: this.provider,
        amountInPaise: Number(input.amountInPaise),
        currency: input.currency || 'INR',
        keyId: this.keyId,
      };
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: input.amountInPaise,
        currency: input.currency || 'INR',
        receipt: input.receiptNumber,
        notes: {
          tenantId: input.tenantId,
          planSlug: input.planSlug,
          ...input.notes,
        },
      });

      return {
        providerOrderId: order.id,
        provider: this.provider,
        amountInPaise: Number(order.amount),
        currency: order.currency,
        keyId: this.keyId,
      };
    } catch (error: any) {
      const msg = error?.error?.description || error?.message || 'Razorpay order creation failed';
      this.logger.error(`Razorpay order creation failed: ${msg}`, error?.stack);
      throw new Error(msg);
    }
  }

  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
    if (!signature || !this.webhookSecret) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const signatureBuf = Buffer.from(signature, 'utf-8');

      if (expectedBuf.length !== signatureBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, signatureBuf);
    } catch (err: any) {
      this.logger.warn(`Signature verification error: ${err.message}`);
      return false;
    }
  }

  parseWebhook(payload: Record<string, any>): NormalizedWebhookEvent {
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const eventId = payload.account_id ? `${payload.account_id}_${payload.created_at}` : `rzp_evt_${Date.now()}`;

    let normalizedType: NormalizedWebhookEvent['eventType'] = 'UNKNOWN';
    if (eventType === 'payment.captured') {
      normalizedType = 'PAYMENT_CAPTURED';
    } else if (eventType === 'payment.failed') {
      normalizedType = 'PAYMENT_FAILED';
    } else if (eventType === 'order.paid') {
      normalizedType = 'ORDER_PAID';
    }

    return {
      eventId: payload.id || eventId,
      eventType: normalizedType,
      provider: this.provider,
      providerOrderId: paymentEntity?.order_id || orderEntity?.id,
      providerPaymentId: paymentEntity?.id,
      amountInPaise: paymentEntity?.amount || orderEntity?.amount_paid,
      paymentMethod: paymentEntity?.method,
      paymentDetails: {
        method: paymentEntity?.method,
        vpa: paymentEntity?.vpa,
        bank: paymentEntity?.bank,
        wallet: paymentEntity?.wallet,
        cardLast4: paymentEntity?.card?.last4,
        cardNetwork: paymentEntity?.card?.network,
      },
      failureReason: paymentEntity?.error_description || null,
      rawPayload: payload,
    };
  }

  async fetchPaymentStatus(providerOrderId: string): Promise<GatewayPaymentStatusResult | null> {
    try {
      const paymentsResponse: any = await this.razorpay.orders.fetchPayments(providerOrderId);
      const items = paymentsResponse.items || [];

      if (items.length === 0) {
        return null;
      }

      // Check if any payment succeeded
      const capturedPayment = items.find((p: any) => p.status === 'captured');
      if (capturedPayment) {
        return {
          providerOrderId,
          providerPaymentId: capturedPayment.id,
          status: PaymentStatusEnum.SUCCESS,
          amountInPaise: Number(capturedPayment.amount),
          paymentMethod: capturedPayment.method,
        };
      }

      // Check if all payments failed
      const allFailed = items.every((p: any) => p.status === 'failed');
      if (allFailed) {
        return {
          providerOrderId,
          status: PaymentStatusEnum.FAILED,
          amountInPaise: Number(items[0]?.amount || 0),
          paymentMethod: items[0]?.method,
        };
      }

      return {
        providerOrderId,
        status: PaymentStatusEnum.PENDING,
        amountInPaise: Number(items[0]?.amount || 0),
        paymentMethod: items[0]?.method,
      };
    } catch (error: any) {
      this.logger.error(`Error querying payments for order ${providerOrderId}: ${error.message}`);
      return null;
    }
  }
}
