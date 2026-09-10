import { Inject, Injectable } from '@nestjs/common';
import { GetInvoiceQuery } from './get-invoice.query';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetInvoiceHandler {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoiceQuery): Promise<Invoice> {
    const { invoiceId, labId } = query;

    const invoice = await this.invoiceRepository.findById(invoiceId, labId);
    if (!invoice) {
      throw new EntityNotFoundException('Invoice', invoiceId);
    }

    return invoice;
  }
}
