import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetSharedReportPdfQuery } from './get-shared-report-pdf.query';
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
import { DomainForbiddenException } from 'src/modules/shared/domain/exceptions/domain-forbidden.exception';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { GeneratedPdfResult } from '../get-report-pdf/get-report-pdf.handler';

@Injectable()
export class GetSharedReportPdfHandler {
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

  async execute(query: GetSharedReportPdfQuery): Promise<GeneratedPdfResult> {
    const { token } = query;

    const report = await this.reportRepository.findByShareToken(token);
    if (!report) {
      throw new EntityNotFoundException('Report', token);
    }

    if (report.shareExpiresAt && report.shareExpiresAt < new Date()) {
      throw new DomainForbiddenException('Report share link has expired');
    }

    const lab = await this.labRepository.findById(report.labId);
    if (!lab) {
      throw new EntityNotFoundException('Lab', report.labId);
    }

    let referringDoctor = null;
    if (report.refByDoctorId && this.doctorRepository) {
      referringDoctor = await this.doctorRepository.findById(
        report.refByDoctorId,
        report.labId,
      );
    }

    const profiles = await this.profileRepository.findByLabId(report.labId);
    const pathologist =
      profiles.find((p) => p.role === RoleEnum.PATHOLOGIST) ||
      profiles.find((p) => p.role === RoleEnum.OWNER) ||
      null;

    const publicAppUrl = this.configService?.get<string>(
      'APP_PUBLIC_URL',
      'https://labos.app',
    );

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
