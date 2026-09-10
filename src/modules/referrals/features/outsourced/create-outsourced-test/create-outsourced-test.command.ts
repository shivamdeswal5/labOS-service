import { CreateOutsourcedTestDto } from './create-outsourced-test.dto';

export class CreateOutsourcedTestCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: CreateOutsourcedTestDto,
  ) {}
}
