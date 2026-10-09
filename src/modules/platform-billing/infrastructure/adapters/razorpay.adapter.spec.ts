import { describe, it, expect, beforeEach } from 'vitest';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { RazorpayGatewayAdapter } from './razorpay.adapter';

describe('RazorpayGatewayAdapter', () => {
  let adapter: RazorpayGatewayAdapter;
  const webhookSecret = 'test_webhook_secret_key_123';

  beforeEach(() => {
    const configService = {
      get: (key: string, defaultVal?: string) => {
        if (key === 'RAZORPAY_KEY_ID') return 'rzp_test_123';
        if (key === 'RAZORPAY_KEY_SECRET') return 'secret_456';
        if (key === 'RAZORPAY_WEBHOOK_SECRET') return webhookSecret;
        return defaultVal;
      },
    } as unknown as ConfigService;

    adapter = new RazorpayGatewayAdapter(configService);
  });

  describe('verifyWebhookSignature', () => {
    it('returns true when HMAC SHA-256 matches payload and secret', () => {
      const rawBody = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_test_123' } } },
      });

      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const isValid = adapter.verifyWebhookSignature(rawBody, signature);
      expect(isValid).toBe(true);
    });

    it('returns false when signature is forged or invalid', () => {
      const rawBody = JSON.stringify({ event: 'payment.captured' });
      const fakeSignature = 'forged_fake_signature_abc_123';

      const isValid = adapter.verifyWebhookSignature(rawBody, fakeSignature);
      expect(isValid).toBe(false);
    });

    it('returns false when signature is missing', () => {
      const rawBody = JSON.stringify({ event: 'payment.captured' });
      const isValid = adapter.verifyWebhookSignature(rawBody, '');
      expect(isValid).toBe(false);
    });
  });

  describe('parseWebhook', () => {
    it('normalizes payment.captured event correctly', () => {
      const payload = {
        id: 'evt_captured_999',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_captured_123',
              order_id: 'order_abc_456',
              amount: 99900,
              method: 'upi',
              vpa: 'owner@okhdfcbank',
            },
          },
        },
      };

      const normalized = adapter.parseWebhook(payload);
      expect(normalized.eventId).toBe('evt_captured_999');
      expect(normalized.eventType).toBe('PAYMENT_CAPTURED');
      expect(normalized.providerOrderId).toBe('order_abc_456');
      expect(normalized.providerPaymentId).toBe('pay_captured_123');
      expect(normalized.amountInPaise).toBe(99900);
      expect(normalized.paymentMethod).toBe('upi');
      expect(normalized.paymentDetails?.vpa).toBe('owner@okhdfcbank');
    });

    it('normalizes payment.failed event with failureReason', () => {
      const payload = {
        id: 'evt_failed_001',
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_456',
              order_id: 'order_xyz_789',
              amount: 49900,
              error_description: 'Payment was declined by customer bank',
            },
          },
        },
      };

      const normalized = adapter.parseWebhook(payload);
      expect(normalized.eventId).toBe('evt_failed_001');
      expect(normalized.eventType).toBe('PAYMENT_FAILED');
      expect(normalized.failureReason).toBe('Payment was declined by customer bank');
    });
  });
});
