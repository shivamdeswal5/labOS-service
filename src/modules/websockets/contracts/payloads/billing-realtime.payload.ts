import { PaymentMethodEnum } from 'src/modules/billing/domain/invoice/enums/payment-method.enum';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';

export interface IPaymentRecordedPayload {
  invoiceId: string;
  labId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  paidAt: string;
}
