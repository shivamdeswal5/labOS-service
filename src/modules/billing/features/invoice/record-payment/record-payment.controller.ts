import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RecordPaymentHandler } from './record-payment.handler';
import { RecordPaymentCommand } from './record-payment.command';
import { RecordPaymentDto } from './record-payment.dto';

@Controller('billing/invoices')
@UseGuards(AuthGuard)
export class RecordPaymentController {
  constructor(private readonly handler: RecordPaymentHandler) {}

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
