import { AdminManualActivationDto } from './admin-manual-activation.dto';

export class AdminManualActivationCommand {
  constructor(
    public readonly dto: AdminManualActivationDto,
    public readonly adminEmail: string,
  ) {}
}
