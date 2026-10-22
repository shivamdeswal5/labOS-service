import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateClinicalRemarksHandler } from './generate-clinical-remarks.handler';
import { GenerateClinicalRemarksCommand } from './generate-clinical-remarks.command';
import { IReportRepository } from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import { IAiService } from 'src/modules/shared/infrastructure/ai/interfaces/ai-service.interface';
import { NotFoundException } from '@nestjs/common';
import { Report } from 'src/modules/reports/domain/report/report.entity';

describe('GenerateClinicalRemarksHandler', () => {
  let handler: GenerateClinicalRemarksHandler;
  let reportRepo: IReportRepository;
  let aiService: IAiService;

  beforeEach(() => {
    reportRepo = {
      findById: vi.fn(),
    } as unknown as IReportRepository;

    aiService = {
      generateClinicalImpression: vi.fn().mockResolvedValue('Suggested clinical remarks from AI.'),
      generatePatientSummary: vi.fn(),
    } as IAiService;

    handler = new GenerateClinicalRemarksHandler(reportRepo, aiService);
  });

  it('should throw NotFoundException if report is not found', async () => {
    vi.spyOn(reportRepo, 'findById').mockResolvedValue(null);

    await expect(
      handler.execute(new GenerateClinicalRemarksCommand('rep-1', 'lab-1')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should collect parameters and draft values and call aiService', async () => {
    const mockReport = {
      id: 'rep-1',
      labId: 'lab-1',
      patient: { age: '40 Y', sex: 'MALE' },
      reportPanels: [
        {
          panel: {
            name: 'Lipid Profile',
            sections: [
              {
                parameters: [
                  { id: 'param-1', name: 'Total Cholesterol', unit: 'mg/dL', normalRange: '< 200' },
                ],
              },
            ],
          },
        },
      ],
      values: [{ parameterId: 'param-1', value: '240', isOutOfRange: true }],
    } as unknown as Report;

    vi.spyOn(reportRepo, 'findById').mockResolvedValue(mockReport);

    const result = await handler.execute(
      new GenerateClinicalRemarksCommand('rep-1', 'lab-1', {
        draftValues: [{ parameterId: 'param-1', value: '250', isOutOfRange: true }],
      }),
    );

    expect(result.impression).toBe('Suggested clinical remarks from AI.');
    expect(aiService.generateClinicalImpression).toHaveBeenCalledWith({
      patientAge: '40 Y',
      patientSex: 'MALE',
      panelNames: ['Lipid Profile'],
      parameters: [
        {
          parameterName: 'Total Cholesterol',
          value: '250',
          unit: 'mg/dL',
          normalRange: '< 200',
          isOutOfRange: true,
        },
      ],
    });
  });
});
