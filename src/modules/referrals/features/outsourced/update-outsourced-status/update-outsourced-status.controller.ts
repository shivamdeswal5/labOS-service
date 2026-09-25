import { Controller, Patch, Param, Body } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { UpdateOutsourcedStatusHandler } from './update-outsourced-status.handler';
import { UpdateOutsourcedStatusCommand } from './update-outsourced-status.command';
import { UpdateOutsourcedStatusDto } from './update-outsourced-status.dto';

@Controller('referrals/outsourced')
export class UpdateOutsourcedStatusController {
  constructor(private readonly handler: UpdateOutsourcedStatusHandler) {}

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOutsourcedStatusDto,
  ) {
    return this.handler.execute(
      new UpdateOutsourcedStatusCommand(id, user.labId, dto),
    );
  }
}
