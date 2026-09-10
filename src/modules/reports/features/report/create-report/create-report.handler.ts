import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { CreateReportCommand } from './create-report.command';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { ReportPanel } from 'src/modules/reports/domain/report/report-panel.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { EntityConflictException } from 'src/modules/shared/domain/exceptions/entity-conflict.exception';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';
import { SampleStatusEnum } from 'src/modules/reports/domain/report/enums/sample-status.enum';

@Injectable()
export class CreateReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateReportCommand): Promise<Report> {
    const { labId, dto } = command;

    const patient = await this.patientRepository.findById(dto.patientId, labId);
    if (!patient) {
      throw new EntityNotFoundException('Patient', dto.patientId);
    }

    const reports = await this.reportRepository.findByLabId(labId);
    const reportNumberTaken = reports.some((r) => r.reportNumber === dto.reportNumber);
    if (reportNumberTaken) {
      throw new EntityConflictException(`Report number '${dto.reportNumber}' already exists in this lab`);
    }

    const shareToken = randomBytes(32).toString('hex');

    return this.dataSource.transaction(async (manager) => {
      const report = manager.create(Report, {
        labId,
        patientId: dto.patientId,
        reportNumber: dto.reportNumber,
        refByDoctorId: dto.refByDoctorId ?? null,
        status: ReportStatusEnum.DRAFT,
        sampleStatus: SampleStatusEnum.COLLECTED,
        remarks: dto.remarks ?? null,
        shareToken,
        sampleCollectedAt: new Date(),
      });
      const savedReport = await manager.save(report);

      for (const panelId of dto.panelIds) {
        const reportPanel = manager.create(ReportPanel, {
          reportId: savedReport.id,
          panelId,
        });
        await manager.save(reportPanel);
      }

      return manager.findOneOrFail(Report, {
        where: { id: savedReport.id },
        relations: {
          patient: true,
          reportPanels: { panel: true },
        },
      });
    });
  }
}
