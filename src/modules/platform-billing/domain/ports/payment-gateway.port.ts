import { PaymentProviderEnum, PaymentStatusEnum, PlanSlugEnum } from '../enums/platform-billing.enums';

export interface CreateGatewayOrderInput {
  tenantId: string;
  planSlug: PlanSlugEnum;
  amountInPaise: number;
  currency: string;
  receiptNumber: string;
  notes?: Record<string, string>;
}

export interface GatewayOrderResult {
  providerOrderId: string;
  provider: PaymentProviderEnum;
  amountInPaise: number;
  currency: string;
  keyId: string;
}

export type NormalizedWebhookEventType =
  | 'PAYMENT_CAPTURED'
  | 'PAYMENT_FAILED'
  | 'ORDER_PAID'
  | 'UNKNOWN';

export interface NormalizedWebhookEvent {
  eventId: string;
  eventType: NormalizedWebhookEventType;
  provider: PaymentProviderEnum;
  providerOrderId?: string;
  providerPaymentId?: string;
  amountInPaise?: number;
  paymentMethod?: string;
  paymentDetails?: Record<string, any>;
  failureReason?: string;
  rawPayload: Record<string, any>;
}

export interface GatewayPaymentStatusResult {
  providerOrderId: string;
  providerPaymentId?: string;
  status: PaymentStatusEnum;
  amountInPaise: number;
  paymentMethod?: string;
}

export const PAYMENT_GATEWAY_PORT = Symbol('PAYMENT_GATEWAY_PORT');

export interface IPaymentGatewayPort {
  readonly provider: PaymentProviderEnum;
  createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult>;
  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean;
  parseWebhook(payload: Record<string, any>): NormalizedWebhookEvent;
  fetchPaymentStatus(providerOrderId: string): Promise<GatewayPaymentStatusResult | null>;
}
