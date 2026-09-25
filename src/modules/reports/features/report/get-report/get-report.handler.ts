import { Inject, Injectable } from '@nestjs/common';
import { GetReportQuery } from './get-report.query';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY_TOKEN,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) { }

  async execute(query: GetReportQuery): Promise<Report> {
    const report = await this.reportRepository.findById(query.reportId, query.labId);
    if (!report) {
      throw new EntityNotFoundException('Report', query.reportId);
    }

    const [invoice, doctor] = await Promise.all([
      this.invoiceRepository.findByReportId(query.reportId, query.labId),
      report.refByDoctorId
        ? this.doctorRepository.findById(report.refByDoctorId, query.labId)
        : Promise.resolve(null),
    ]);

    (report as unknown as { invoice: unknown }).invoice = invoice;
    (report as unknown as { refByDoctor: unknown }).refByDoctor = doctor;

    return report;
  }
}
