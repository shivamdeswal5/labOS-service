import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { SimulatePaymentCaptureHandler } from './simulate-payment-capture.handler';
import { SimulatePaymentCaptureCommand } from './simulate-payment-capture.command';
import { SimulatePaymentCaptureDto } from './simulate-payment-capture.dto';

@Controller('billing/payments/simulate-capture')
export class SimulatePaymentCaptureController {
  constructor(private readonly handler: SimulatePaymentCaptureHandler) {}

  @Post()
  async simulateCapture(
    @Req() req: any,
    @Body() dto: SimulatePaymentCaptureDto,
  ) {
    const labId = req.user?.labId;
    if (!labId) {
      throw new BadRequestException('User is not associated with an active laboratory');
    }

    return this.handler.execute(new SimulatePaymentCaptureCommand(labId, dto));
  }
}
