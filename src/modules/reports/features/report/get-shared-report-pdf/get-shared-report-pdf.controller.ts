import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from 'src/modules/shared/decorators/public.decorator';
import { GetSharedReportPdfHandler } from './get-shared-report-pdf.handler';
import { GetSharedReportPdfQuery } from './get-shared-report-pdf.query';

@Controller('reports')
export class GetSharedReportPdfController {
  constructor(private readonly handler: GetSharedReportPdfHandler) {}

  @Public()
  @Get('share/:token/pdf')
  async getPublicPdf(@Param('token') token: string, @Res() res: Response) {
    const { buffer, reportNumber } = await this.handler.execute(
      new GetSharedReportPdfQuery(token),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Report-${reportNumber}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
