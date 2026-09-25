import { Inject, Injectable } from '@nestjs/common';
import { ListReportsQuery } from './list-reports.query';
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ListReportsHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(query: ListReportsQuery): Promise<Report[]> {
    let reports: Report[];
    if (query.patientId) {
      if (!UUID_REGEX.test(query.patientId)) {
        return [];
      }
      reports = await this.reportRepository.findByPatientId(query.labId, query.patientId);
    } else {
      reports = await this.reportRepository.findByLabId(query.labId, query.status);
    }

    const [invoices, doctors] = await Promise.all([
      this.invoiceRepository.findByLabId(query.labId),
      this.doctorRepository.findByLabId(query.labId),
    ]);

    const invoiceByReportId = new Map(
      invoices.filter((inv) => inv.reportId).map((inv) => [inv.reportId!, inv]),
    );
    const doctorMap = new Map(doctors.map((d) => [d.id, d]));

    for (const report of reports) {
      (report as unknown as { invoice: unknown }).invoice = invoiceByReportId.get(report.id) ?? null;
      if (report.refByDoctorId) {
        (report as unknown as { refByDoctor: unknown }).refByDoctor = doctorMap.get(report.refByDoctorId) ?? null;
      }
    }

    return reports;
  }
}
