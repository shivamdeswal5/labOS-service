import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetReportPdfQuery } from './get-report-pdf.query';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  ILabRepository,
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { ReportPdfGeneratorService } from 'src/modules/reports/infrastructure/pdf/report-pdf-generator.service';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';

export interface GeneratedPdfResult {
  buffer: Buffer;
  reportNumber: string;
}

@Injectable()
export class GetReportPdfHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepository: ILabRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    @Optional()
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository?: IDoctorRepository,
    private readonly pdfGenerator?: ReportPdfGeneratorService,
    private readonly configService?: ConfigService,
  ) {}

  async execute(query: GetReportPdfQuery): Promise<GeneratedPdfResult> {
    const { labId, reportId } = query;

    const report = await this.reportRepository.findById(reportId, labId);
    if (!report) {
      throw new EntityNotFoundException('Report', reportId);
    }

    const lab = await this.labRepository.findById(labId);
    if (!lab) {
      throw new EntityNotFoundException('Lab', labId);
    }

    let referringDoctor = null;
    if (report.refByDoctorId && this.doctorRepository) {
      referringDoctor = await this.doctorRepository.findById(report.refByDoctorId, labId);
    }

    const profiles = await this.profileRepository.findByLabId(labId);
    const pathologist =
      profiles.find((p) => p.role === RoleEnum.PATHOLOGIST) ||
      profiles.find((p) => p.role === RoleEnum.OWNER) ||
      null;

    const publicAppUrl = this.configService?.get<string>('APP_PUBLIC_URL', 'https://labos.app');

    const buffer = await this.pdfGenerator!.generatePdf({
      report,
      lab,
      pathologist,
      referringDoctor,
      publicAppUrl,
    });

    return {
      buffer,
      reportNumber: report.reportNumber,
    };
  }
}
