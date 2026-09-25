import { Controller, Post, Param, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RecordPaymentHandler } from './record-payment.handler';
import { RecordPaymentCommand } from './record-payment.command';
import { RecordPaymentDto } from './record-payment.dto';

@Controller('invoices')
export class RecordPaymentController {
  constructor(private readonly handler: RecordPaymentHandler) { }

  @Post(':id/payments')
  async recordPayment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.handler.execute(
      new RecordPaymentCommand(id, user.labId, dto),
    );
  }
}
