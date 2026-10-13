import { AdminExtendTrialDto } from './admin-extend-trial.dto';

export class AdminExtendTrialCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: AdminExtendTrialDto,
    public readonly adminEmail: string,
  ) {}
}
