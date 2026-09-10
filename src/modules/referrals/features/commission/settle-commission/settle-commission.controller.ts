import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { SettleCommissionHandler } from './settle-commission.handler';
import { SettleCommissionCommand } from './settle-commission.command';
import { SettleCommissionDto } from './settle-commission.dto';

@Controller('referrals/commission')
@UseGuards(AuthGuard)
export class SettleCommissionController {
  constructor(private readonly handler: SettleCommissionHandler) {}

  @Post('settle')
  async settle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SettleCommissionDto,
  ) {
    return this.handler.execute(new SettleCommissionCommand(user.labId, dto));
  }
}
