export interface TenantInvoiceDto {
  id: string;
  invoiceNumber: string;
  amountInr: number;
  subtotalInr: number;
  taxAmountInr: number;
  customerGstin: string | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  pdfUrl: string | null;
  status: string;
  createdAt: string;
  paymentMethod?: string | null;
  providerPaymentId?: string | null;
}
