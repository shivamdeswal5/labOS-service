import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { GetInvoiceHandler } from './get-invoice.handler';
import { GetInvoiceQuery } from './get-invoice.query';

@Controller('billing/invoices')
@UseGuards(AuthGuard)
export class GetInvoiceController {
  constructor(private readonly handler: GetInvoiceHandler) {}

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.handler.execute(new GetInvoiceQuery(id, user.labId));
  }
}
