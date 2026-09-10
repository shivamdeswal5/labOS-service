import { Inject, Injectable } from '@nestjs/common';
import { CreateInvoiceCommand } from './create-invoice.command';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import { InvoiceItem } from 'src/modules/billing/domain/invoice/invoice-item.entity';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';

@Injectable()
export class CreateInvoiceHandler {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(command: CreateInvoiceCommand): Promise<Invoice> {
    const { labId, dto } = command;

    const invoiceNumber =
      await this.invoiceRepository.generateInvoiceNumber(labId);

    let subtotal = 0;
    const items: Partial<InvoiceItem>[] = dto.items.map((item) => {
      const quantity = item.quantity ?? 1;
      const total = Number(item.unitPrice) * quantity;
      subtotal += total;

      return {
        description: item.description,
        unitPrice: item.unitPrice,
        quantity,
        total,
      };
    });

    const discount = dto.discount ?? 0;
    const totalAmount = Math.max(0, subtotal - discount);

    return this.invoiceRepository.create({
      labId,
      patientId: dto.patientId,
      reportId: dto.reportId ?? null,
      invoiceNumber,
      subtotal,
      discount,
      totalAmount,
      paidAmount: 0,
      paymentStatus: PaymentStatusEnum.UNPAID,
      paymentMethod: null,
      paidAt: null,
      notes: dto.notes ?? null,
      items: items as InvoiceItem[],
    });
  }
}
