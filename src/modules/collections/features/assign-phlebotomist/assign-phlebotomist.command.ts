import { AssignPhlebotomistDto } from './assign-phlebotomist.dto';

export class AssignPhlebotomistCommand {
  constructor(
    public readonly labId: string,
    public readonly id: string,
    public readonly dto: AssignPhlebotomistDto,
  ) {}
}
