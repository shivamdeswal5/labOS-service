import { Controller, Post, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { CreateInvoiceHandler } from './create-invoice.handler';
import { CreateInvoiceCommand } from './create-invoice.command';
import { CreateInvoiceDto } from './create-invoice.dto';

@Controller('invoices')
export class CreateInvoiceController {
  constructor(private readonly handler: CreateInvoiceHandler) { }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.handler.execute(new CreateInvoiceCommand(user.labId, dto));
  }
}
