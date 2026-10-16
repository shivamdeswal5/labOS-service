import { Controller, Delete, Req, BadRequestException } from '@nestjs/common';
import { CancelScheduledDowngradeHandler } from './cancel-scheduled-downgrade.handler';
import { CancelScheduledDowngradeCommand } from './cancel-scheduled-downgrade.command';

@Controller('billing/subscriptions/cancel-downgrade')
export class CancelScheduledDowngradeController {
  constructor(private readonly handler: CancelScheduledDowngradeHandler) {}

  @Delete()
  async cancelDowngrade(@Req() req: any) {
    const labId = req.user?.labId;
    if (!labId) {
      throw new BadRequestException('User is not associated with an active laboratory');
    }

    return this.handler.execute(new CancelScheduledDowngradeCommand(labId));
  }
}
