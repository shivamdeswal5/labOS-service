import { CreateInvoiceDto } from './create-invoice.dto';

export class CreateInvoiceCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreateInvoiceDto,
  ) {}
}
