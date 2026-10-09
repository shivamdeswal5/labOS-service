import { Injectable } from '@nestjs/common';
import {
  IPaymentGatewayPort,
  CreateGatewayOrderInput,
  GatewayOrderResult,
  NormalizedWebhookEvent,
  GatewayPaymentStatusResult,
} from '../../domain/ports/payment-gateway.port';
import { PaymentProviderEnum, PaymentStatusEnum } from '../../domain/enums/platform-billing.enums';

@Injectable()
export class ManualPaymentAdapter implements IPaymentGatewayPort {
  readonly provider = PaymentProviderEnum.MANUAL;

  async createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult> {
    const orderId = `manual_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      providerOrderId: orderId,
      provider: this.provider,
      amountInPaise: input.amountInPaise,
      currency: input.currency || 'INR',
      keyId: 'manual',
    };
  }

  verifyWebhookSignature(_rawBody: Buffer | string, _signature: string): boolean {
    return false; // Manual payments do not have webhook signatures
  }

  parseWebhook(payload: Record<string, any>): NormalizedWebhookEvent {
    return {
      eventId: `manual_evt_${Date.now()}`,
      eventType: 'UNKNOWN',
      provider: this.provider,
      rawPayload: payload,
    };
  }

  async fetchPaymentStatus(providerOrderId: string): Promise<GatewayPaymentStatusResult | null> {
    return {
      providerOrderId,
      status: PaymentStatusEnum.SUCCESS,
      amountInPaise: 0,
      paymentMethod: 'MANUAL_UTR',
    };
  }
}
