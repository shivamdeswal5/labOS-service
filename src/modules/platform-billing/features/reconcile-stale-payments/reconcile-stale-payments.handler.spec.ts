import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReconcileStalePaymentsHandler } from './reconcile-stale-payments.handler';
import { PaymentStatusEnum } from '../../domain/enums/platform-billing.enums';
import { QUEUE_NAMES } from 'src/modules/shared/infrastructure/queue/pg-boss.service';

describe('ReconcileStalePaymentsHandler', () => {
  let handler: ReconcileStalePaymentsHandler;
  let mockPaymentRepo: any;
  let mockRazorpayAdapter: any;
  let mockWebhookHandler: any;
  let mockQueueService: any;

  beforeEach(() => {
    mockPaymentRepo = {
      findStalePending: vi.fn(),
      findInvoicesMissingPdf: vi.fn().mockResolvedValue([]),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    mockRazorpayAdapter = {
      fetchPaymentStatus: vi.fn(),
    };

    mockWebhookHandler = {
      activateSubscriptionFromPayment: vi.fn(),
    };

    mockQueueService = {
      sendJob: vi.fn().mockResolvedValue('job-1'),
    };

    handler = new ReconcileStalePaymentsHandler(
      mockPaymentRepo,
      mockRazorpayAdapter,
      mockWebhookHandler,
      mockQueueService,
    );
  });

  it('should reconcile stale pending payment when Razorpay confirms SUCCESS', async () => {
    mockPaymentRepo.findStalePending.mockResolvedValueOnce([
      {
        id: 'pay-stale-1',
        providerOrderId: 'order_stale_123',
        status: PaymentStatusEnum.PENDING,
      },
    ]);

    mockRazorpayAdapter.fetchPaymentStatus.mockResolvedValueOnce({
      status: PaymentStatusEnum.SUCCESS,
      providerPaymentId: 'pay_captured_123',
      amountInPaise: 99900,
      paymentMethod: 'upi',
    });

    const result = await handler.execute();

    expect(result.reconciledCount).toBe(1);
    expect(mockWebhookHandler.activateSubscriptionFromPayment).toHaveBeenCalledWith({
      providerOrderId: 'order_stale_123',
      providerPaymentId: 'pay_captured_123',
      amountInPaise: 99900,
      paymentMethod: 'upi',
    });
  });

  it('should mark stale pending payment as EXPIRED when Razorpay confirms FAILED', async () => {
    const stalePayment = {
      id: 'pay-stale-2',
      providerOrderId: 'order_failed_456',
      status: PaymentStatusEnum.PENDING,
    };
    mockPaymentRepo.findStalePending.mockResolvedValueOnce([stalePayment]);

    mockRazorpayAdapter.fetchPaymentStatus.mockResolvedValueOnce({
      status: PaymentStatusEnum.FAILED,
    });

    const result = await handler.execute();

    expect(result.reconciledCount).toBe(0);
    expect(stalePayment.status).toBe(PaymentStatusEnum.EXPIRED);
    expect(mockPaymentRepo.save).toHaveBeenCalledWith(stalePayment);
    expect(mockWebhookHandler.activateSubscriptionFromPayment).not.toHaveBeenCalled();
  });

  it('should recover missing invoice PDFs by re-enqueuing pg-boss jobs', async () => {
    mockPaymentRepo.findStalePending.mockResolvedValueOnce([]);
    mockPaymentRepo.findInvoicesMissingPdf.mockResolvedValueOnce([
      {
        id: 'inv-missing-1',
        labId: 'lab-1',
        invoiceNumber: 'PATHIQ-INV-2026-100001',
        pdfUrl: null,
      },
      {
        id: 'inv-missing-2',
        labId: 'lab-2',
        invoiceNumber: 'PATHIQ-INV-2026-100002',
        pdfUrl: null,
      },
    ]);

    await handler.execute();

    expect(mockQueueService.sendJob).toHaveBeenCalledTimes(2);
    expect(mockQueueService.sendJob).toHaveBeenCalledWith(
      QUEUE_NAMES.GENERATE_SUBSCRIPTION_INVOICE_PDF,
      {
        invoiceId: 'inv-missing-1',
        labId: 'lab-1',
      },
    );
    expect(mockQueueService.sendJob).toHaveBeenCalledWith(
      QUEUE_NAMES.GENERATE_SUBSCRIPTION_INVOICE_PDF,
      {
        invoiceId: 'inv-missing-2',
        labId: 'lab-2',
      },
    );
  });
});
