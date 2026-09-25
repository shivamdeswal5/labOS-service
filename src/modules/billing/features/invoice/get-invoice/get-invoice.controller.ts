import { Controller, Get, Param } from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { GetInvoiceHandler } from './get-invoice.handler';
import { GetInvoiceQuery } from './get-invoice.query';

@Controller('invoices')
export class GetInvoiceController {
  constructor(private readonly handler: GetInvoiceHandler) { }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.handler.execute(new GetInvoiceQuery(id, user.labId));
  }
}
