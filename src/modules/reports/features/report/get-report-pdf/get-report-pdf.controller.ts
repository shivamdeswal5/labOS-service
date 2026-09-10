import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { GetReportPdfHandler } from './get-report-pdf.handler';
import { GetReportPdfQuery } from './get-report-pdf.query';

@Controller('reports')
@UseGuards(AuthGuard)
export class GetReportPdfController {
  constructor(private readonly handler: GetReportPdfHandler) {}

  @Get(':id/pdf')
  async getPdf(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, reportNumber } = await this.handler.execute(
      new GetReportPdfQuery(user.labId, id),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Report-${reportNumber}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
