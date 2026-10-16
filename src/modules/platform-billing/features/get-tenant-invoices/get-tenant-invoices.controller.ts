import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetTenantInvoicesHandler } from './get-tenant-invoices.handler';
import { GetTenantInvoicesQuery } from './get-tenant-invoices.query';
import { TenantInvoiceDto } from './get-tenant-invoices.dto';

@Controller('billing/invoices')
export class GetTenantInvoicesController {
  constructor(private readonly handler: GetTenantInvoicesHandler) {}

  @Get()
  async getInvoices(@Req() req: Request): Promise<TenantInvoiceDto[]> {
    const labId = (req as any).user?.labId;
    return this.handler.execute(new GetTenantInvoicesQuery(labId));
  }
}
