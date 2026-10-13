import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/shared/guards/super-admin.guard';
import { AdminPurgeTestDataHandler, AdminPurgeTestDataResult } from './admin-purge-test-data.handler';
import { AdminPurgeTestDataDto } from './admin-purge-test-data.dto';
import { AdminPurgeTestDataCommand } from './admin-purge-test-data.command';

@Controller('billing/admin/tenants')
@UseGuards(SuperAdminGuard)
export class AdminPurgeTestDataController {
  constructor(private readonly handler: AdminPurgeTestDataHandler) {}

  @Post(':id/purge-test-data')
  async purgeTestData(
    @Param('id') labId: string,
    @Body() _dto: AdminPurgeTestDataDto,
    @Req() req: any,
  ): Promise<AdminPurgeTestDataResult> {
    const adminEmail = req.user?.email || 'admin@pathiq.in';
    return this.handler.execute(new AdminPurgeTestDataCommand(labId, adminEmail));
  }
}
