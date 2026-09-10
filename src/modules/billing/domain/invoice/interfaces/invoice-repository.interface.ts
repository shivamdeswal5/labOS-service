import { Invoice } from '../invoice.entity';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

export const INVOICE_REPOSITORY_TOKEN = Symbol('IInvoiceRepository');

export interface FindInvoicesFilter {
  status?: PaymentStatusEnum;
  patientId?: string;
  reportId?: string;
}

export interface IInvoiceRepository {
  findById(id: string, labId: string): Promise<Invoice | null>;
  findByReportId(reportId: string, labId: string): Promise<Invoice | null>;
  findByLabId(labId: string, filter?: FindInvoicesFilter): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  create(data: Partial<Invoice>): Promise<Invoice>;
  generateInvoiceNumber(labId: string): Promise<string>;
}
