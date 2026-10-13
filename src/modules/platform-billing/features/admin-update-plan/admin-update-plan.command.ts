import { AdminUpdatePlanDto } from './admin-update-plan.dto';

export class AdminUpdatePlanCommand {
  constructor(
    public readonly planId: string,
    public readonly dto: AdminUpdatePlanDto,
    public readonly adminEmail: string,
  ) {}
}
