import { PreviewSubscriptionTransitionDto } from './preview-subscription-transition.dto';

export class PreviewSubscriptionTransitionQuery {
  constructor(
    public readonly labId: string,
    public readonly dto: PreviewSubscriptionTransitionDto,
  ) {}
}
