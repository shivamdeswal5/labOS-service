import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { ClinicalImpressionInput } from './interfaces/ai-service.interface';

describe('GeminiService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: vi.fn().mockReturnValue(null),
    } as unknown as ConfigService;
  });

  it('should generate deterministic normal impression when all parameters are in range', async () => {
    const service = new GeminiService(configService);
    const input: ClinicalImpressionInput = {
      patientAge: '32 Y',
      patientSex: 'MALE',
      panelNames: ['Complete Blood Count (CBC)'],
      parameters: [
        { parameterName: 'Hemoglobin', value: '14.5', unit: 'g/dL', normalRange: '13-17', isOutOfRange: false },
        { parameterName: 'Total Leukocyte Count', value: '7200', unit: '/cumm', normalRange: '4000-11000', isOutOfRange: false },
      ],
    };

    const result = await service.generateClinicalImpression(input);
    expect(result).toContain('normal biological reference intervals');
  });

  it('should generate clinical impression with differential suggestions for anemia', async () => {
    const service = new GeminiService(configService);
    const input: ClinicalImpressionInput = {
      patientAge: '45 Y',
      patientSex: 'FEMALE',
      panelNames: ['Complete Blood Count (CBC)'],
      parameters: [
        { parameterName: 'Hemoglobin (Hb)', value: '8.4', unit: 'g/dL', normalRange: '12-15', isOutOfRange: true },
        { parameterName: 'Packed Cell Volume (PCV)', value: '28.0', unit: '%', normalRange: '36-46', isOutOfRange: true },
      ],
    };

    const result = await service.generateClinicalImpression(input);
    expect(result).toContain('microcytic hypochromic anemia');
    expect(result).toContain('Serum Ferritin');
  });

  it('should generate bilingual patient smart summary with educational guidance and doctor referral', async () => {
    const service = new GeminiService(configService);
    const input: ClinicalImpressionInput = {
      patientAge: '45 Y',
      patientSex: 'FEMALE',
      panelNames: ['Complete Blood Count (CBC)'],
      parameters: [
        { parameterName: 'Hemoglobin (Hb)', value: '8.4', unit: 'g/dL', normalRange: '12-15', isOutOfRange: true },
        { parameterName: 'Platelet Count', value: '2.5', unit: 'Lakh/cumm', normalRange: '1.5-4.5', isOutOfRange: false },
      ],
    };

    const summary = await service.generatePatientSummary(input, 'Dr. A. K. Mehra');
    expect(summary.testedCount).toBe(2);
    expect(summary.abnormalCount).toBe(1);
    expect(summary.overviewTextEn).toContain('outside the standard reference range');
    expect(summary.overviewTextHi).toContain('पैरामीटर सामान्य सीमा से बाहर हैं');
    expect(summary.consultationRecommendationEn).toContain('Dr. A. K. Mehra');
    expect(summary.consultationRecommendationHi).toContain('Dr. A. K. Mehra');

    const hbParam = summary.highlightedParameters.find((p) => p.parameterName === 'Hemoglobin (Hb)');
    expect(hbParam).toBeDefined();
    expect(hbParam?.status).toBe('ATTENTION_NEEDED');
    expect(hbParam?.lifestyleTipEn).toBeDefined();
    expect(hbParam?.lifestyleTipHi).toBeDefined();
  });
});
