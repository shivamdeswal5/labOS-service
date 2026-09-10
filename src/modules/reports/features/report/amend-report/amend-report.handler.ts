import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AmendReportCommand } from './amend-report.command';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { ReportValue } from 'src/modules/reports/domain/report/report-value.entity';
import { ReportAmendment } from 'src/modules/reports/domain/report/report-amendment.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainValidationException } from 'src/modules/shared/domain/exceptions/domain-validation.exception';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';
import { NormalRange } from 'src/modules/panels/domain/panel/value-objects/normal-range.value-object';

@Injectable()
export class AmendReportHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: AmendReportCommand): Promise<Report> {
    const { reportId, labId, amendedByUserId, dto } = command;

    const report = await this.reportRepository.findById(reportId, labId);
    if (!report) {
      throw new EntityNotFoundException('Report', reportId);
    }

    if (report.status !== ReportStatusEnum.FINALIZED) {
      throw new DomainValidationException('Only finalized reports can be amended');
    }

    const patient = await this.patientRepository.findById(report.patientId, labId);

    return this.dataSource.transaction(async (manager) => {
      const previousData = (report.values ?? []).map((v) => ({
        parameterId: v.parameterId,
        value: v.value,
        isOutOfRange: v.isOutOfRange,
        remarks: v.remarks,
      }));

      const amendment = manager.create(ReportAmendment, {
        reportId,
        amendedBy: amendedByUserId,
        reason: dto.reason,
        previousData,
      });
      await manager.save(amendment);

      await manager.delete(ReportValue, { reportId });

      for (const v of dto.values) {
        const parameter = report.reportPanels
          ?.flatMap((rp) => rp.panel?.sections ?? [])
          .flatMap((s) => s.parameters ?? [])
          .find((p) => p.id === v.parameterId);

        const isOutOfRange = NormalRange.isOutOfRange(
          parameter?.normalRange ?? null,
          v.value,
          patient?.sex,
        );

        const value = manager.create(ReportValue, {
          reportId,
          parameterId: v.parameterId,
          value: v.value,
          isOutOfRange,
          remarks: v.remarks ?? null,
        });
        await manager.save(value);
      }

      return manager.findOneOrFail(Report, {
        where: { id: reportId },
        relations: {
          patient: true,
          reportPanels: { panel: { sections: { parameters: true } } },
          values: { parameter: true },
          amendments: true,
        },
      });
    });
  }
}
