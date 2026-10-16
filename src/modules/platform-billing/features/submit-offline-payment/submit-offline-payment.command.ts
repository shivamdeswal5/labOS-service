import { SubmitOfflinePaymentDto } from './submit-offline-payment.dto';

export class SubmitOfflinePaymentCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: SubmitOfflinePaymentDto,
  ) {}
}
