import { SimulatePaymentCaptureDto } from './simulate-payment-capture.dto';

export class SimulatePaymentCaptureCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: SimulatePaymentCaptureDto,
  ) {}
}
