import { PlatformPayment } from '../../entities/platform-payment.entity';
import { SubscriptionInvoice } from '../../entities/subscription-invoice.entity';

export interface IPaymentRepository {
  findById(id: string): Promise<PlatformPayment | null>;
  findByOrderId(orderId: string): Promise<PlatformPayment | null>;
  findByPaymentId(paymentId: string): Promise<PlatformPayment | null>;
  findRecentPending(labId: string, amountInPaise: number, since: Date): Promise<PlatformPayment | null>;
  findStalePending(olderThan: Date, newerThan: Date): Promise<PlatformPayment[]>;
  findAll(limit?: number, offset?: number): Promise<{ items: PlatformPayment[]; total: number }>;
  save(payment: PlatformPayment): Promise<PlatformPayment>;
  create(data: Partial<PlatformPayment>): PlatformPayment;
  createInvoice(data: Partial<SubscriptionInvoice>): Promise<SubscriptionInvoice>;
}

export const PAYMENT_REPOSITORY_TOKEN = Symbol('IPaymentRepository');
