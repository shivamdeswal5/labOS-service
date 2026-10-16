import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetTenantInvoicesHandler } from './get-tenant-invoices.handler';
import { GetTenantInvoicesQuery } from './get-tenant-invoices.query';

describe('GetTenantInvoicesHandler', () => {
  let handler: GetTenantInvoicesHandler;
  let mockPaymentRepo: any;

  beforeEach(() => {
    mockPaymentRepo = {
      findInvoicesByLabId: vi.fn(),
    };
    handler = new GetTenantInvoicesHandler(mockPaymentRepo);
  });

  it('should return mapped invoices with tax breakdown and payment details', async () => {
    const mockInvoices = [
      {
        id: 'inv-1',
        invoiceNumber: 'PATHIQ-INV-2026-0001',
        amountInr: 1178.82,
        subtotalInr: 999.0,
        taxAmountInr: 179.82,
        customerGstin: '07AAAAA0000A1Z5',
        billingPeriodStart: new Date('2026-10-14'),
        billingPeriodEnd: new Date('2026-11-14'),
        pdfUrl: 'https://storage/inv-1.pdf',
        status: 'PAID',
        createdAt: new Date('2026-10-14T10:00:00Z'),
        payment: {
          paymentMethod: 'UPI',
          providerPaymentId: 'pay_123456',
        },
      },
    ];

    mockPaymentRepo.findInvoicesByLabId.mockResolvedValueOnce(mockInvoices);

    const result = await handler.execute(new GetTenantInvoicesQuery('lab-1'));

    expect(result).toHaveLength(1);
    expect(result[0].invoiceNumber).toBe('PATHIQ-INV-2026-0001');
    expect(result[0].amountInr).toBe(1178.82);
    expect(result[0].subtotalInr).toBe(999.0);
    expect(result[0].taxAmountInr).toBe(179.82);
    expect(result[0].paymentMethod).toBe('UPI');
    expect(result[0].providerPaymentId).toBe('pay_123456');
    expect(result[0].pdfUrl).toBe('https://storage/inv-1.pdf');
  });

  it('should return empty list when lab has no invoices', async () => {
    mockPaymentRepo.findInvoicesByLabId.mockResolvedValueOnce([]);

    const result = await handler.execute(new GetTenantInvoicesQuery('lab-unknown'));

    expect(result).toEqual([]);
  });
});
