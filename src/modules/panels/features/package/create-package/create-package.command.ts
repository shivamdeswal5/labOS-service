import { CreatePackageDto } from './create-package.dto';

export class CreatePackageCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreatePackageDto,
  ) {}
}
