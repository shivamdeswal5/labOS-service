import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListInvoicesHandler } from './list-invoices.handler';
import { ListInvoicesQuery } from './list-invoices.query';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';

@Controller('billing/invoices')
@UseGuards(AuthGuard)
export class ListInvoicesController {
  constructor(private readonly handler: ListInvoicesHandler) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: PaymentStatusEnum,
    @Query('patientId') patientId?: string,
    @Query('reportId') reportId?: string,
  ) {
    return this.handler.execute(
      new ListInvoicesQuery(user.labId, status, patientId, reportId),
    );
  }
}
