import { Inject, Injectable } from '@nestjs/common';
import { ListInvoicesQuery } from './list-invoices.query';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';

@Injectable()
export class ListInvoicesHandler {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: ListInvoicesQuery): Promise<Invoice[]> {
    const { labId, status, patientId, reportId } = query;

    return this.invoiceRepository.findByLabId(labId, {
      status,
      patientId,
      reportId,
    });
  }
}
