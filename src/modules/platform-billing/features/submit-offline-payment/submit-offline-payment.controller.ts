import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { SubmitOfflinePaymentHandler } from './submit-offline-payment.handler';
import { SubmitOfflinePaymentCommand } from './submit-offline-payment.command';
import { SubmitOfflinePaymentDto } from './submit-offline-payment.dto';

@Controller('billing/payments/offline-utr')
export class SubmitOfflinePaymentController {
  constructor(private readonly handler: SubmitOfflinePaymentHandler) {}

  @Post()
  async submitOfflinePayment(
    @Req() req: any,
    @Body() dto: SubmitOfflinePaymentDto,
  ) {
    const labId = req.user?.labId;
    if (!labId) {
      throw new BadRequestException('User is not associated with an active laboratory');
    }

    return this.handler.execute(new SubmitOfflinePaymentCommand(labId, dto));
  }
}
