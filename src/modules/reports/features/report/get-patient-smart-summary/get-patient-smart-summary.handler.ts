import { Inject, Injectable } from '@nestjs/common';
import { GetPatientSmartSummaryQuery } from './get-patient-smart-summary.query';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  IAiService,
  AI_SERVICE_TOKEN,
  ClinicalImpressionInput,
  ParameterClinicalData,
  PatientSmartSummary,
} from 'src/modules/shared/infrastructure/ai/interfaces/ai-service.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';
import { DomainForbiddenException } from 'src/modules/shared/domain/exceptions/domain-forbidden.exception';

@Injectable()
export class GetPatientSmartSummaryHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(AI_SERVICE_TOKEN)
    private readonly aiService: IAiService,
  ) {}

  async execute(query: GetPatientSmartSummaryQuery): Promise<PatientSmartSummary> {
    const { token } = query;
    const report = await this.reportRepository.findByShareToken(token);

    if (!report) {
      throw new EntityNotFoundException('Report', token);
    }

    if (report.shareExpiresAt && report.shareExpiresAt < new Date()) {
      throw new DomainForbiddenException('Report share link has expired');
    }

    const panelNames: string[] = [];
    const allParameters: ParameterClinicalData[] = [];

    const savedValuesMap = new Map<string, { value: string; isOutOfRange: boolean }>();
    for (const val of report.values || []) {
      if (val.parameterId) {
        savedValuesMap.set(val.parameterId, {
          value: val.value,
          isOutOfRange: val.isOutOfRange ?? false,
        });
      }
    }

    for (const rp of report.reportPanels || []) {
      if (rp.panel) {
        panelNames.push(rp.panel.name);
        for (const section of rp.panel.sections || []) {
          for (const param of section.parameters || []) {
            const saved = savedValuesMap.get(param.id);
            if (!saved || !saved.value) continue;

            allParameters.push({
              parameterName: param.name,
              value: saved.value,
              unit: param.unit || null,
              normalRange: typeof param.normalRange === 'string' ? param.normalRange : null,
              isOutOfRange: saved.isOutOfRange,
            });
          }
        }
      }
    }

    const input: ClinicalImpressionInput = {
      patientAge: report.patient?.age || null,
      patientSex: report.patient?.sex ? String(report.patient.sex) : null,
      panelNames,
      parameters: allParameters,
    };

    return this.aiService.generatePatientSummary(input, null);
  }
}
