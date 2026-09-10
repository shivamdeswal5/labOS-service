import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';

export class ListInvoicesQuery {
  constructor(
    public readonly labId: string,
    public readonly status?: PaymentStatusEnum,
    public readonly patientId?: string,
    public readonly reportId?: string,
  ) {}
}
