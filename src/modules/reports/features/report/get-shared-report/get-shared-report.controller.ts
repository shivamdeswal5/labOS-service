import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/modules/shared/decorators/public.decorator';
import { GetSharedReportHandler } from './get-shared-report.handler';
import { GetSharedReportQuery } from './get-shared-report.query';

@Controller('reports')
export class GetSharedReportController {
  constructor(private readonly handler: GetSharedReportHandler) {}

  @Public()
  @Get('share/:token')
  async getByToken(@Param('token') token: string) {
    return this.handler.execute(new GetSharedReportQuery(token));
  }
}
