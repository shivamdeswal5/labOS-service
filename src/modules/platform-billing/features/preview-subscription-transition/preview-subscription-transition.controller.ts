import { Controller, Get, Query, Req, BadRequestException } from '@nestjs/common';
import { PreviewSubscriptionTransitionHandler } from './preview-subscription-transition.handler';
import { PreviewSubscriptionTransitionQuery } from './preview-subscription-transition.query';
import { PreviewSubscriptionTransitionDto } from './preview-subscription-transition.dto';

@Controller('billing/subscriptions/preview-transition')
export class PreviewSubscriptionTransitionController {
  constructor(private readonly handler: PreviewSubscriptionTransitionHandler) {}

  @Get()
  async previewTransition(
    @Req() req: any,
    @Query() dto: PreviewSubscriptionTransitionDto,
  ) {
    const labId = req.user?.labId;
    if (!labId) {
      throw new BadRequestException('User is not associated with an active laboratory');
    }

    return this.handler.execute(new PreviewSubscriptionTransitionQuery(labId, dto));
  }
}
