import { Inject, Injectable } from '@nestjs/common';
import { RecordPaymentCommand } from './record-payment.command';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';

@Injectable()
export class RecordPaymentHandler {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(command: RecordPaymentCommand): Promise<Invoice> {
    const { invoiceId, labId, dto } = command;

    const invoice = await this.invoiceRepository.findById(invoiceId, labId);
    if (!invoice) {
      throw new EntityNotFoundException('Invoice', invoiceId);
    }

    const newPaid = Number(invoice.paidAmount) + Number(dto.amount);
    invoice.paidAmount = newPaid;
    invoice.paymentMethod = dto.paymentMethod;

    if (newPaid >= Number(invoice.totalAmount)) {
      invoice.paymentStatus = PaymentStatusEnum.PAID;
      invoice.paidAt = new Date();
    } else {
      invoice.paymentStatus = PaymentStatusEnum.PARTIALLY_PAID;
    }

    if (dto.notes) {
      invoice.notes = invoice.notes
        ? `${invoice.notes}\n${dto.notes}`
        : dto.notes;
    }

    return this.invoiceRepository.save(invoice);
  }
}
