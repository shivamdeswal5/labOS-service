import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GenerateClinicalRemarksCommand } from './generate-clinical-remarks.command';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import {
  IAiService,
  AI_SERVICE_TOKEN,
  ClinicalImpressionInput,
  ParameterClinicalData,
} from 'src/modules/shared/infrastructure/ai/interfaces/ai-service.interface';

@Injectable()
export class GenerateClinicalRemarksHandler {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
    @Inject(AI_SERVICE_TOKEN)
    private readonly aiService: IAiService,
  ) {}

  async execute(command: GenerateClinicalRemarksCommand): Promise<{ impression: string }> {
    const { reportId, labId, dto } = command;
    const report = await this.reportRepository.findById(reportId, labId);

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    const panelNames: string[] = [];
    const allParameters: ParameterClinicalData[] = [];

    // Map overrides if provided from the front-end form draft
    const overrideMap = new Map<string, { value: string; isOutOfRange?: boolean }>();
    if (dto?.draftValues && Array.isArray(dto.draftValues)) {
      for (const d of dto.draftValues) {
        overrideMap.set(d.parameterId, { value: d.value, isOutOfRange: d.isOutOfRange });
      }
    }

    // Map existing saved values
    const savedValuesMap = new Map<string, { value: string; isOutOfRange: boolean }>();
    for (const val of report.values || []) {
      if (val.parameterId) {
        savedValuesMap.set(val.parameterId, {
          value: val.value,
          isOutOfRange: val.isOutOfRange ?? false,
        });
      }
    }

    // Traverse all panels and parameters
    for (const rp of report.reportPanels || []) {
      if (rp.panel) {
        panelNames.push(rp.panel.name);
        for (const section of rp.panel.sections || []) {
          for (const param of section.parameters || []) {
            const override = overrideMap.get(param.id);
            const saved = savedValuesMap.get(param.id);

            const value = override ? override.value : saved ? saved.value : '';
            if (!value) continue; // skip unentered parameters

            const isOutOfRange =
              override?.isOutOfRange !== undefined
                ? override.isOutOfRange
                : saved?.isOutOfRange ?? false;

            allParameters.push({
              parameterName: param.name,
              value,
              unit: param.unit || null,
              normalRange: typeof param.normalRange === 'string' ? param.normalRange : null,
              isOutOfRange,
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

    const impression = await this.aiService.generateClinicalImpression(input);

    return { impression };
  }
}
