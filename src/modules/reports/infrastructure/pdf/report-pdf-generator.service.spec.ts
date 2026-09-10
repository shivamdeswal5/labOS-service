import { describe, it, expect } from 'vitest';
import { ReportPdfGeneratorService } from './report-pdf-generator.service';
import { Report } from '../../domain/report/report.entity';
import { Patient } from '../../domain/patient/patient.entity';
import { ReportValue } from '../../domain/report/report-value.entity';
import { PanelParameter } from 'src/modules/panels/domain/panel/panel-parameter.entity';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';
import { NormalRangeTypeEnum } from 'src/modules/panels/domain/panel/enums/normal-range-type.enum';

describe('ReportPdfGeneratorService', () => {
  const service = new ReportPdfGeneratorService();

  it('generates a valid, non-empty A4 PDF buffer with %PDF- header', async () => {
    const lab = new Lab();
    lab.id = 'lab-1';
    lab.name = 'Apex Diagnostic & Research Centre';
    lab.address = '123 Civil Lines, New Delhi';
    lab.phoneNumbers = ['+91 9876543210', '+91 11 23456789'];
    lab.tagline = 'Excellence in Pathology & Diagnostics';
    lab.accentColor = '#1e3a8a';

    const patient = new Patient();
    patient.id = 'pat-1';
    patient.name = 'Rajesh Kumar';
    patient.age = '42Y';
    patient.sex = SexEnum.MALE;
    patient.patientNumber = 'P-2026-0042';
    patient.phone = '+91 9811122233';

    const param1 = new PanelParameter();
    param1.id = 'param-1';
    param1.name = 'Hemoglobin';
    param1.unit = 'g/dL';
    param1.method = 'Cyanmethemoglobin';
    param1.normalRange = {
      type: NormalRangeTypeEnum.GENDER_SPECIFIC,
      male: { min: 13.0, max: 17.0 },
      female: { min: 12.0, max: 15.5 },
    };

    const val1 = new ReportValue();
    val1.id = 'val-1';
    val1.parameterId = 'param-1';
    val1.parameter = param1;
    val1.value = '14.5';
    val1.isOutOfRange = false;

    const param2 = new PanelParameter();
    param2.id = 'param-2';
    param2.name = 'Fasting Blood Sugar';
    param2.unit = 'mg/dL';
    param2.method = 'GOD-POD';
    param2.normalRange = {
      type: NormalRangeTypeEnum.NUMERIC,
      min: 70,
      max: 100,
    };

    const val2 = new ReportValue();
    val2.id = 'val-2';
    val2.parameterId = 'param-2';
    val2.parameter = param2;
    val2.value = '145';
    val2.isOutOfRange = true; // Abnormal reading

    const report = new Report();
    report.id = 'rep-1';
    report.labId = 'lab-1';
    report.patientId = 'pat-1';
    report.patient = patient;
    report.reportNumber = 'REP-2026-00100';
    report.shareToken = 'tok_secure_random_verification_1234567890';
    report.sampleCollectedAt = new Date('2026-09-08T07:30:00Z');
    report.finalizedAt = new Date('2026-09-08T11:00:00Z');
    report.remarks = 'Mild fasting hyperglycemia noted. Advised HbA1c correlation.';
    report.values = [val1, val2];

    const pathologist = new Profile();
    pathologist.id = 'prof-1';
    pathologist.fullName = 'Dr. Sunita Deshmukh';
    pathologist.qualification = 'M.D. (Pathology), D.N.B.';
    pathologist.role = RoleEnum.PATHOLOGIST;

    const buffer = await service.generatePdf({
      report,
      lab,
      pathologist,
      referringDoctor: {
        id: 'doc-1',
        labId: 'lab-1',
        name: 'Dr. A. K. Verma',
      } as any,
      publicAppUrl: 'https://test.labos.app',
    });

    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);

    // Verify PDF Magic Bytes: "%PDF-1."
    const header = buffer.subarray(0, 7).toString('ascii');
    expect(header).toMatch(/^%PDF-1\./);
  });
});
