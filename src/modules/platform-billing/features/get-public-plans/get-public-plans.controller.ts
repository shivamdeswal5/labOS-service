import { Controller, Get } from '@nestjs/common';
import { GetPublicPlansHandler } from './get-public-plans.handler';
import { GetPublicPlansQuery } from './get-public-plans.query';
import { Public } from 'src/modules/shared/decorators/public.decorator';

@Controller('billing/plans')
export class GetPublicPlansController {
  constructor(private readonly handler: GetPublicPlansHandler) {}

  @Public()
  @Get()
  async getPlans() {
    return this.handler.execute(new GetPublicPlansQuery());
  }
}
