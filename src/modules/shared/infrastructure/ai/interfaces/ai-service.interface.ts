export const AI_SERVICE_TOKEN = Symbol('IAiService');

export interface ParameterClinicalData {
  parameterName: string;
  value: string;
  unit?: string | null;
  normalRange?: string | null;
  isOutOfRange: boolean;
}

export interface ClinicalImpressionInput {
  patientAge?: string | null;
  patientSex?: string | null;
  panelNames: string[];
  parameters: ParameterClinicalData[];
}

export interface PatientSmartSummaryParam {
  parameterName: string;
  value: string;
  unit?: string | null;
  status: 'OPTIMAL' | 'ATTENTION_NEEDED';
  explanationEn: string;
  explanationHi: string;
  lifestyleTipEn?: string;
  lifestyleTipHi?: string;
}

export interface PatientSmartSummary {
  overviewTextEn: string;
  overviewTextHi: string;
  testedCount: number;
  abnormalCount: number;
  highlightedParameters: PatientSmartSummaryParam[];
  consultationRecommendationEn: string;
  consultationRecommendationHi: string;
}

export interface IAiService {
  generateClinicalImpression(input: ClinicalImpressionInput): Promise<string>;
  generatePatientSummary(
    input: ClinicalImpressionInput,
    referringDoctorName?: string | null,
  ): Promise<PatientSmartSummary>;
}
