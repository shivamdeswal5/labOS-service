import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminGetPaymentsHandler } from './admin-get-payments.handler';
import { AdminGetPaymentsQuery } from './admin-get-payments.query';
import { AdminGetPaymentsResponseDto } from './admin-payment-list-item.dto';

@Controller('billing/admin')
@UseGuards(SuperAdminGuard)
export class AdminGetPaymentsController {
  constructor(private readonly handler: AdminGetPaymentsHandler) {}

  @Get('payments')
  async getPayments(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<AdminGetPaymentsResponseDto> {
    const take = limit ? Number(limit) : 50;
    const skip = offset ? Number(offset) : 0;
    return this.handler.execute(new AdminGetPaymentsQuery(take, skip));
  }
}
