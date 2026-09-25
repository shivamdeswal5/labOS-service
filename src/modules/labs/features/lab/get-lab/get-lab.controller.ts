import { Controller, Get } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { GetLabQuery } from './get-lab.query';
import { GetLabHandler } from './get-lab.handler';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';

@Controller('labs')
export class GetLabController {
  constructor(private readonly handler: GetLabHandler) {}

  @Get('current')
  async execute(@CurrentUser() user: AuthenticatedUser): Promise<Lab> {
    return this.handler.execute(new GetLabQuery(user.labId));
  }
}
