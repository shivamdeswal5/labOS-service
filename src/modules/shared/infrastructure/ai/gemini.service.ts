import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAiService,
  ClinicalImpressionInput,
  ParameterClinicalData,
  PatientSmartSummary,
  PatientSmartSummaryParam,
} from './interfaces/ai-service.interface';

@Injectable()
export class GeminiService implements IAiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string | null;
  private readonly apiEndpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      process.env.GEMINI_API_KEY ||
      null;
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      this.logger.warn(
        'GEMINI_API_KEY not configured. Running in high-fidelity deterministic clinical fallback mode.',
      );
      this.apiKey = null;
    }
  }

  /**
   * Generates an ISO 15189 compliant clinical impression for pathologists.
   */
  async generateClinicalImpression(input: ClinicalImpressionInput): Promise<string> {
    const abnormalParams = input.parameters.filter((p) => p.isOutOfRange);

    if (abnormalParams.length === 0) {
      return 'All analytical parameters examined fall within normal biological reference intervals for patient age and sex. Advise clinical correlation.';
    }

    if (!this.apiKey) {
      return this.generateDeterministicImpression(input, abnormalParams);
    }

    try {
      const prompt = `
You are a senior consultant clinical pathologist advising a registered NABL-compliant diagnostic laboratory.
Draft a concise, professional, ISO 15189 compliant clinical impression for the "Pathologist Remarks" section of a diagnostic report.

PATIENT CONTEXT:
- Age: ${input.patientAge || 'Adult'}
- Biological Sex: ${input.patientSex || 'Unspecified'}
- Panels Evaluated: ${input.panelNames.join(', ')}

ABNORMAL / OUT-OF-RANGE PARAMETERS:
${abnormalParams.map((p) => `- ${p.parameterName}: ${p.value} ${p.unit || ''} (Ref: ${p.normalRange || 'Standard'})`).join('\n')}

ALL OTHER PARAMETERS:
${input.parameters.filter((p) => !p.isOutOfRange).map((p) => `${p.parameterName}: ${p.value}`).join(', ')}

STRICT RULES:
1. Maximum 2 to 3 sentences. Academic, rigorous medical terminology only (e.g. "Microcytic hypochromic indices", "Transaminitis", "Impaired fasting glucose").
2. Never provide an absolute diagnosis; use cautious phrasing like "Suggestive of", "Consistent with", or "Consider".
3. Recommend relevant clinical correlation or standard confirmatory tests where appropriate (e.g., "Advise correlation with Serum Ferritin / Peripheral Smear examination").
4. Output ONLY the raw paragraph of remarks. No markdown headings, no greetings, no bullet points.
`;

      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 250,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API error (${response.status}): ${errorText}`);
        return this.generateDeterministicImpression(input, abnormalParams);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText && typeof rawText === 'string') {
        return rawText.trim();
      }

      return this.generateDeterministicImpression(input, abnormalParams);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to generate AI impression: ${msg}`);
      return this.generateDeterministicImpression(input, abnormalParams);
    }
  }

  /**
   * Generates a patient-friendly, bilingual (English + Hindi) educational summary.
   * Strictly adheres to NMC guidelines: educational only, no medical prescriptions,
   * no "home cures", and explicitly directs patient to the treating clinician.
   */
  async generatePatientSummary(
    input: ClinicalImpressionInput,
    referringDoctorName?: string | null,
  ): Promise<PatientSmartSummary> {
    const abnormalParams = input.parameters.filter((p) => p.isOutOfRange);
    const doctorRef = referringDoctorName ? `Dr. ${referringDoctorName.replace(/^Dr\.?\s*/i, '')}` : 'your treating doctor';

    if (!this.apiKey) {
      return this.generateDeterministicPatientSummary(input, abnormalParams, doctorRef);
    }

    try {
      const prompt = `
You are a compassionate, medically licensed healthcare communicator creating a "Smart Health Summary" for an Indian diagnostic laboratory.
Your goal is to explain laboratory findings to a patient in simple, reassuring, layperson terms in both English and Hindi.

PATIENT:
- Age: ${input.patientAge || 'Adult'} | Sex: ${input.patientSex || 'Unspecified'}
- Treating Physician: ${doctorRef}
- Tests: ${input.panelNames.join(', ')}

MEASURED RESULTS:
${input.parameters.map((p) => `- ${p.parameterName}: ${p.value} ${p.unit || ''} (Ref: ${p.normalRange || 'Normal'}) -> ${p.isOutOfRange ? 'OUT OF RANGE' : 'NORMAL'}`).join('\n')}

MANDATORY LEGAL & CLINICAL RULES:
1. NEVER diagnose diseases or claim that a condition can be "cured at home".
2. NEVER say "you do not need a doctor". Always emphasize discussing results with ${doctorRef}.
3. Provide general nutritional awareness (e.g. iron-rich foods, adequate hydration, balanced diet) as general health context, NEVER as medical prescriptions.
4. Hindi translations must be natural, respectful, and easy to read (Devanagari script).

Respond strictly in valid JSON matching this schema:
{
  "overviewTextEn": "string (1-2 sentences summarizing overall status in English)",
  "overviewTextHi": "string (Hindi translation of overview)",
  "testedCount": number,
  "abnormalCount": number,
  "highlightedParameters": [
    {
      "parameterName": "string",
      "value": "string",
      "unit": "string or null",
      "status": "OPTIMAL" | "ATTENTION_NEEDED",
      "explanationEn": "string (1 plain English sentence explaining what this biomarker does)",
      "explanationHi": "string (Hindi translation)",
      "lifestyleTipEn": "string or null (General wellness/diet context)",
      "lifestyleTipHi": "string or null"
    }
  ],
  "consultationRecommendationEn": "string (Advising review with treating doctor)",
  "consultationRecommendationHi": "string (Hindi translation)"
}
`;

      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API error (${response.status}): ${errorText}`);
        return this.generateDeterministicPatientSummary(input, abnormalParams, doctorRef);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText) as PatientSmartSummary;
        return parsed;
      }

      return this.generateDeterministicPatientSummary(input, abnormalParams, doctorRef);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to generate patient smart summary: ${msg}`);
      return this.generateDeterministicPatientSummary(input, abnormalParams, doctorRef);
    }
  }

  /**
   * Deterministic clinical fallback if AI API key is not configured or offline.
   */
  private generateDeterministicImpression(
    input: ClinicalImpressionInput,
    abnormalParams: ParameterClinicalData[],
  ): string {
    const names = abnormalParams.map((p) => p.parameterName);
    const hasLowHb = abnormalParams.some(
      (p) => /hemoglobin|hb/i.test(p.parameterName) && parseFloat(p.value) < 12,
    );
    const hasHighSugar = abnormalParams.some(
      (p) => /glucose|sugar|hba1c/i.test(p.parameterName),
    );
    const hasHighLipid = abnormalParams.some(
      (p) => /cholesterol|triglyceride/i.test(p.parameterName),
    );

    if (hasLowHb) {
      return `Parameters demonstrate reduced hemoglobin and altered erythrocytic indices (${names.slice(0, 3).join(', ')}). Suggestive of microcytic hypochromic anemia. Advise correlation with Serum Ferritin, Iron profile, and Peripheral Blood Smear examination.`;
    }

    if (hasHighSugar) {
      return `Elevated glycemic indices observed. Suggestive of impaired glycemic control / carbohydrate intolerance. Advise clinical correlation with fasting plasma glucose, post-prandial evaluation, and consultation with treating physician.`;
    }

    if (hasHighLipid) {
      return `Dyslipidemic pattern noted with altered lipid fractions. Suggestive of metabolic lipid imbalance. Advise correlation with dietary assessment, cardiovascular risk profiling, and treating clinician review.`;
    }

    return `Biological parameters outside standard reference intervals observed for ${names.slice(0, 4).join(', ')}. Findings warrant clinical correlation with patient symptomatology, medical history, and treating physician consultation.`;
  }

  /**
   * Deterministic bilingual patient summary fallback.
   */
  private generateDeterministicPatientSummary(
    input: ClinicalImpressionInput,
    abnormalParams: ParameterClinicalData[],
    doctorRef: string,
  ): PatientSmartSummary {
    const highlightedParameters: PatientSmartSummaryParam[] = input.parameters.map((p) => {
      const isAbn = p.isOutOfRange;
      const paramName = p.parameterName;

      let explanationEn = `Measures standard biological level of ${paramName} in circulation.`;
      let explanationHi = `यह रक्त में ${paramName} के स्तर की जांच करता है।`;
      let lifestyleTipEn: string | undefined;
      let lifestyleTipHi: string | undefined;

      if (/hemoglobin|hb/i.test(paramName)) {
        explanationEn = 'Hemoglobin carries oxygen from your lungs to the rest of your body.';
        explanationHi = 'हीमोग्लोबिन आपके फेफड़ों से शरीर के बाकी हिस्सों तक ऑक्सीजन पहुंचाने का काम करता है।';
        lifestyleTipEn = 'Lentils, spinach, pomegranate, and beetroot are natural dietary sources supporting iron levels.';
        lifestyleTipHi = 'दालें, पालक, अनार और चुकंदर प्राकृतिक रूप से शरीर में आयरन के स्तर को सहारा देते हैं।';
      } else if (/glucose|sugar/i.test(paramName)) {
        explanationEn = 'Blood glucose indicates energy levels and carbohydrate metabolism.';
        explanationHi = 'ब्लड ग्लूकोज आपके शरीर में शर्करा और ऊर्जा संतुलन को दर्शाता है।';
        lifestyleTipEn = 'Regular physical activity, mindful meal portions, and limiting refined sweets support balanced glucose.';
        lifestyleTipHi = 'नियमित व्यायाम और संतुलित आहार रक्त शर्करा को नियंत्रित रखने में सहायक होते हैं।';
      } else if (/platelet/i.test(paramName)) {
        explanationEn = 'Platelets are essential blood cells that help blood clot and prevent bleeding.';
        explanationHi = 'प्लेटलेट्स रक्त का थक्का जमाने और चोट लगने पर खून रोकने में मदद करते हैं।';
      }

      return {
        parameterName: paramName,
        value: p.value,
        unit: p.unit || null,
        status: isAbn ? 'ATTENTION_NEEDED' : 'OPTIMAL',
        explanationEn,
        explanationHi,
        lifestyleTipEn,
        lifestyleTipHi,
      };
    });

    const abnCount = abnormalParams.length;

    return {
      overviewTextEn:
        abnCount === 0
          ? 'All tested parameters are within optimal biological reference intervals.'
          : `${abnCount} test parameter${abnCount > 1 ? 's are' : ' is'} outside the standard reference range and should be reviewed by your doctor.`,
      overviewTextHi:
        abnCount === 0
          ? 'जांच किए गए सभी पैरामीटर सामान्य और संतुलित सीमा के भीतर हैं।'
          : `${abnCount} पैरामीटर सामान्य सीमा से बाहर हैं, जिनके लिए डॉक्टर से परामर्श आवश्यक है।`,
      testedCount: input.parameters.length,
      abnormalCount: abnCount,
      highlightedParameters,
      consultationRecommendationEn: `Please share and discuss these laboratory findings with ${doctorRef} for personalized medical guidance.`,
      consultationRecommendationHi: `कृपया उचित चिकित्सीय मार्गदर्शन के लिए इन जांच परिणामों को ${doctorRef} के साथ साझा करें।`,
    };
  }
}
