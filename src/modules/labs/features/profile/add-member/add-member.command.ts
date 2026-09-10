import { AddMemberDto } from './add-member.dto';

export class AddMemberCommand {
  constructor(
    public readonly labId: string,
    public readonly dto: AddMemberDto,
  ) {}
}
