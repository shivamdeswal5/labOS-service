import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RecordManualCommissionHandler } from './record-manual-commission.handler';
import { RecordManualCommissionCommand } from './record-manual-commission.command';
import { RecordManualCommissionDto } from './record-manual-commission.dto';

@Controller('referrals/commission')
@UseGuards(AuthGuard)
export class RecordManualCommissionController {
  constructor(private readonly handler: RecordManualCommissionHandler) {}

  @Post('manual')
  async record(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RecordManualCommissionDto,
  ) {
    return this.handler.execute(
      new RecordManualCommissionCommand(user.labId, dto),
    );
  }
}
