import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EnterResultsCommand } from './enter-results.command';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { ReportValue } from 'src/modules/reports/domain/report/report-value.entity';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainForbiddenException } from 'src/modules/shared/domain/exceptions/domain-forbidden.exception';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';
import { SampleStatusEnum } from 'src/modules/reports/domain/report/enums/sample-status.enum';
import { NormalRange } from 'src/modules/panels/domain/panel/value-objects/normal-range.value-object';

@Injectable()
export class EnterResultsHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: EnterResultsCommand): Promise<Report> {
    const { reportId, labId, dto } = command;

    const report = await this.reportRepository.findById(reportId, labId);
    if (!report) {
      throw new EntityNotFoundException('Report', reportId);
    }

    if (report.status === ReportStatusEnum.FINALIZED) {
      throw new DomainForbiddenException('Cannot enter results on a finalized report');
    }

    const patient = await this.patientRepository.findById(report.patientId, labId);

    return this.dataSource.transaction(async (manager) => {
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

      report.sampleStatus = SampleStatusEnum.COMPLETED;
      report.resultsEnteredAt = new Date();
      await manager.save(report);

      return manager.findOneOrFail(Report, {
        where: { id: reportId },
        relations: {
          patient: true,
          reportPanels: { panel: { sections: { parameters: true } } },
          values: { parameter: true },
        },
      });
    });
  }
}
