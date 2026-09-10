import { RecordPaymentDto } from './record-payment.dto';

export class RecordPaymentCommand {
  constructor(
    public readonly invoiceId: string,
    public readonly labId: string,
    public readonly dto: RecordPaymentDto,
  ) {}
}
