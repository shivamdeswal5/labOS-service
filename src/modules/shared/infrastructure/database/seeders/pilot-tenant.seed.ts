import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import { ReportLanguageEnum } from 'src/modules/labs/domain/lab/enums/report-language.enum';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import { PanelSection } from 'src/modules/panels/domain/panel/panel-section.entity';
import { PanelParameter } from 'src/modules/panels/domain/panel/panel-parameter.entity';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { ReportPanel } from 'src/modules/reports/domain/report/report-panel.entity';
import { ReportValue } from 'src/modules/reports/domain/report/report-value.entity';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';
import { SampleStatusEnum } from 'src/modules/reports/domain/report/enums/sample-status.enum';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import { CommissionTypeEnum } from 'src/modules/referrals/domain/doctor/enums/commission-type.enum';
import { DoctorCommissionLedger } from 'src/modules/referrals/domain/commission/doctor-commission-ledger.entity';
import { CommissionStatusEnum } from 'src/modules/referrals/domain/commission/enums/commission-status.enum';
import { OutsourcedTest } from 'src/modules/referrals/domain/outsourced/outsourced-test.entity';
import { OutsourcedTestStatusEnum } from 'src/modules/referrals/domain/outsourced/enums/outsourced-test-status.enum';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import { InvoiceItem } from 'src/modules/billing/domain/invoice/invoice-item.entity';
import { PaymentStatusEnum } from 'src/modules/billing/domain/invoice/enums/payment-status.enum';
import { PaymentMethodEnum } from 'src/modules/billing/domain/invoice/enums/payment-method.enum';
import { Expense } from 'src/modules/billing/domain/expense/expense.entity';
import { ExpenseCategoryEnum } from 'src/modules/billing/domain/expense/enums/expense-category.enum';
import { NotificationLog } from 'src/modules/notifications/domain/notification/notification-log.entity';
import { NotificationChannelEnum } from 'src/modules/notifications/domain/notification/enums/notification-channel.enum';
import { NotificationTypeEnum } from 'src/modules/notifications/domain/notification/enums/notification-type.enum';
import { NotificationStatusEnum } from 'src/modules/notifications/domain/notification/enums/notification-status.enum';
import { RecipientTypeEnum } from 'src/modules/notifications/domain/notification/enums/recipient-type.enum';
import { CollectionRequest } from 'src/modules/collections/domain/collection/collection-request.entity';
import { CollectionStatusEnum } from 'src/modules/collections/domain/collection/enums/collection-status.enum';

const logger = new Logger('PilotTenantSeeder');

export const PILOT_LAB_ID = '6aaabed8-3df0-4569-8b9f-6fcc85ecc783';

export async function seedPilotTenant(dataSource: DataSource): Promise<void> {
  logger.log(`Starting idempotent seed for Dr. Deswal's pilot laboratory (${PILOT_LAB_ID})...`);

  const labRepo = dataSource.getRepository(Lab);
  const profileRepo = dataSource.getRepository(Profile);
  const templateRepo = dataSource.getRepository(PanelTemplate);
  const testPanelRepo = dataSource.getRepository(TestPanel);
  const sectionRepo = dataSource.getRepository(PanelSection);
  const paramRepo = dataSource.getRepository(PanelParameter);
  const patientRepo = dataSource.getRepository(Patient);
  const reportRepo = dataSource.getRepository(Report);
  const reportPanelRepo = dataSource.getRepository(ReportPanel);
  const reportValueRepo = dataSource.getRepository(ReportValue);
  const doctorRepo = dataSource.getRepository(ReferringDoctor);
  const ledgerRepo = dataSource.getRepository(DoctorCommissionLedger);
  const outsourcedRepo = dataSource.getRepository(OutsourcedTest);
  const invoiceRepo = dataSource.getRepository(Invoice);
  const invoiceItemRepo = dataSource.getRepository(InvoiceItem);
  const expenseRepo = dataSource.getRepository(Expense);
  const notifRepo = dataSource.getRepository(NotificationLog);
  const collectionRepo = dataSource.getRepository(CollectionRequest);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. TENANT & LAB PROFILE
  // ───────────────────────────────────────────────────────────────────────────
  let lab = await labRepo.findOne({ where: { id: PILOT_LAB_ID } });
  if (!lab) {
    lab = labRepo.create({
      id: PILOT_LAB_ID,
      name: 'Deswal Diagnostic Laboratory',
      address: 'Near Main Bus Stand, Barara, Ambala, Haryana 133201',
      phoneNumbers: ['+91 85688 84848'],
      accentColor: '#0f766e',
      reportLanguage: ReportLanguageEnum.EN,
    });
    await labRepo.save(lab);
    logger.log('Lab record created.');
  } else {
    lab.name = 'Deswal Diagnostic Laboratory';
    lab.address = 'Near Main Bus Stand, Barara, Ambala, Haryana 133201';
    lab.phoneNumbers = ['+91 85688 84848'];
    lab.accentColor = '#0f766e';
    await labRepo.save(lab);
    logger.log('Lab record verified.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. PATHOLOGIST / OWNER PROFILE
  // ───────────────────────────────────────────────────────────────────────────
  let profile = await profileRepo.findOne({ where: { labId: PILOT_LAB_ID } });
  if (!profile) {
    profile = profileRepo.create({
      id: '4aaabed8-3df0-4569-8b9f-6fcc85ecc780', // Anchor profile ID
      labId: PILOT_LAB_ID,
      role: RoleEnum.OWNER,
      fullName: 'Dr. Deswal',
      qualification: 'MBBS, MD (Pathology)',
    });
    await profileRepo.save(profile);
    logger.log('Pathologist profile created.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. INSTANTIATE ACTIVE TEST CATALOG FROM TEMPLATES IF MISSING
  // ───────────────────────────────────────────────────────────────────────────
  const activePanelsCount = await testPanelRepo.count({ where: { labId: PILOT_LAB_ID } });
  if (activePanelsCount === 0) {
    logger.log('No active test panels found for pilot lab. Instantiating from templates...');
    const templates = await templateRepo.find();
    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      const panel = testPanelRepo.create({
        labId: PILOT_LAB_ID,
        name: t.name,
        category: t.category,
        price: t.defaultPrice,
        sortOrder: i + 1,
      });
      const savedPanel = await testPanelRepo.save(panel);

      const sections = (t.templateData as any)?.sections || [];
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const s = sections[sIdx];
        const section = sectionRepo.create({
          panelId: savedPanel.id,
          name: s.name,
          sortOrder: sIdx + 1,
        });
        const savedSection = await sectionRepo.save(section);

        const params = s.parameters || [];
        for (let pIdx = 0; pIdx < params.length; pIdx++) {
          const p = params[pIdx];
          const param = paramRepo.create({
            sectionId: savedSection.id,
            name: p.name,
            nameLocal: p.nameLocal,
            unit: p.unit,
            inputType: p.inputType || 'NUMBER',
            method: p.method,
            normalRange: p.normalRange,
            sortOrder: pIdx + 1,
          });
          await paramRepo.save(param);
        }
      }
    }
    logger.log(`Instantiated ${templates.length} active diagnostic panels.`);
  }

  // Retrieve CBC panel and its parameters for clinical rehearsals
  const cbcPanel = await testPanelRepo.findOne({
    where: { labId: PILOT_LAB_ID, name: 'Complete Blood Count (CBC) with ESR' },
    relations: { sections: { parameters: true } },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. PATIENT COHORT (RAJESH KUMAR & SUNITA RAO)
  // ───────────────────────────────────────────────────────────────────────────
  const PATIENT_RAJESH_ID = '330bd796-6571-4a4d-831b-091eba19e248';
  let patientRajesh = await patientRepo.findOne({ where: { id: PATIENT_RAJESH_ID } });
  if (!patientRajesh) {
    patientRajesh = patientRepo.create({
      id: PATIENT_RAJESH_ID,
      labId: PILOT_LAB_ID,
      patientNumber: 'P-20260924-0001',
      name: 'Rajesh Kumar',
      age: '45',
      sex: SexEnum.MALE,
      phone: '+919876543210',
      address: 'Ward 4, Near Water Tank, Barara, Ambala',
    });
    await patientRepo.save(patientRajesh);
    logger.log('Seeded patient Rajesh Kumar.');
  }

  const PATIENT_SUNITA_ID = '330bd796-6571-4a4d-831b-091eba19e249';
  let patientSunita = await patientRepo.findOne({ where: { id: PATIENT_SUNITA_ID } });
  if (!patientSunita) {
    patientSunita = patientRepo.create({
      id: PATIENT_SUNITA_ID,
      labId: PILOT_LAB_ID,
      patientNumber: 'P-20260924-0002',
      name: 'Sunita Rao',
      age: '48',
      sex: SexEnum.FEMALE,
      phone: '+919845011234',
      address: 'Station Road, Barara',
    });
    await patientRepo.save(patientSunita);
    logger.log('Seeded patient Sunita Rao.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. REFERRING DOCTOR COHORT
  // ───────────────────────────────────────────────────────────────────────────
  const DOCTOR_MEHRA_ID = 'c1010000-0000-0000-0000-000000000001';
  let docMehra = await doctorRepo.findOne({ where: { id: DOCTOR_MEHRA_ID } });
  if (!docMehra) {
    docMehra = doctorRepo.create({
      id: DOCTOR_MEHRA_ID,
      labId: PILOT_LAB_ID,
      name: 'Dr. A. K. Mehra, MBBS, MD (Medicine)',
      clinic: 'Mehra Medicare & Heart Center, Main Bazaar, Barara',
      phone: '+91 98112 34567',
      commissionType: CommissionTypeEnum.PERCENTAGE,
      commissionValue: 10,
    });
    await doctorRepo.save(docMehra);
  }

  const DOCTOR_GUPTA_ID = 'c1010000-0000-0000-0000-000000000002';
  let docGupta = await doctorRepo.findOne({ where: { id: DOCTOR_GUPTA_ID } });
  if (!docGupta) {
    docGupta = doctorRepo.create({
      id: DOCTOR_GUPTA_ID,
      labId: PILOT_LAB_ID,
      name: 'Dr. Sonia Gupta, MBBS, DGO (Obstetrics & Gynecology)',
      clinic: 'Gupta Maternity Clinic, Station Road, Barara',
      phone: '+91 98960 41234',
      commissionType: CommissionTypeEnum.PERCENTAGE,
      commissionValue: 15,
    });
    await doctorRepo.save(docGupta);
  }

  const DOCTOR_SETHI_ID = 'c1010000-0000-0000-0000-000000000003';
  let docSethi = await doctorRepo.findOne({ where: { id: DOCTOR_SETHI_ID } });
  if (!docSethi) {
    docSethi = doctorRepo.create({
      id: DOCTOR_SETHI_ID,
      labId: PILOT_LAB_ID,
      name: 'Dr. Vikram Sethi, MBBS, MS (Orthopedics)',
      clinic: 'Sethi Bone & Joint Clinic, Jagadhri Road, Barara',
      phone: '+91 94160 55821',
      commissionType: CommissionTypeEnum.FLAT,
      commissionValue: 200,
    });
    await doctorRepo.save(docSethi);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. CLINICAL ENCOUNTERS (LONGITUDINAL VISIT 1 + VISIT 2 FOR RAJESH KUMAR)
  // ───────────────────────────────────────────────────────────────────────────
  // Encounter 1: Baseline Visit (30 days ago, Hb 9.8 g/dL)
  const REPORT_V1_ID = 'f14faf1a-0151-4183-b3ab-012366668d28';
  let reportV1 = await reportRepo.findOne({ where: { id: REPORT_V1_ID } });
  if (!reportV1 && cbcPanel) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    reportV1 = reportRepo.create({
      id: REPORT_V1_ID,
      labId: PILOT_LAB_ID,
      patientId: PATIENT_RAJESH_ID,
      refByDoctorId: DOCTOR_MEHRA_ID,
      reportNumber: 'R-20260825-0001',
      status: ReportStatusEnum.FINALIZED,
      sampleStatus: SampleStatusEnum.COMPLETED,
      sampleCollectedAt: thirtyDaysAgo,
      resultsEnteredAt: thirtyDaysAgo,
      finalizedAt: thirtyDaysAgo,
      shareToken: '8dd27607bd6bd4856aab57bcb5612d22d7981e275eff45871d662106f2f12072',
      remarks: 'Baseline CBC showing microcytic hypochromic anemia prior to iron therapy.',
    });
    await reportRepo.save(reportV1);

    await reportPanelRepo.save(
      reportPanelRepo.create({
        reportId: REPORT_V1_ID,
        panelId: cbcPanel.id,
      }),
    );

    // Seed baseline parameter values
    const allParams = cbcPanel.sections?.flatMap((s) => s.parameters || []) || [];
    const baselineValues: Record<string, { val: string; flag: boolean }> = {
      'Hemoglobin (Hb)': { val: '9.8', flag: true },
      'Total Leukocyte Count (TLC)': { val: '6800', flag: false },
      'Platelet Count': { val: '1.8', flag: false },
      'Packed Cell Volume (PCV)': { val: '32.0', flag: true },
      'Mean Corpuscular Volume (MCV)': { val: '71.0', flag: true },
      'Mean Corpuscular Hemoglobin (MCH)': { val: '20.5', flag: true },
      'MCHC': { val: '28.8', flag: true },
      'RDW-CV': { val: '17.5', flag: true },
      'Erythrocyte Sedimentation Rate (ESR)': { val: '35', flag: true },
    };

    for (const p of allParams) {
      const match = baselineValues[p.name];
      if (match) {
        await reportValueRepo.save(
          reportValueRepo.create({
            reportId: REPORT_V1_ID,
            parameterId: p.id,
            value: match.val,
            isOutOfRange: match.flag,
          }),
        );
      }
    }
    logger.log('Seeded longitudinal baseline report (R-20260825-0001) for Rajesh Kumar.');
  }

  // Encounter 2: Current Visit (R-20260924-0001, Hb recovered to 11.2 g/dL)
  const REPORT_V2_ID = 'f14faf1a-0151-4183-b3ab-012366668d29';
  let reportV2 = await reportRepo.findOne({ where: { id: REPORT_V2_ID } });
  if (!reportV2 && cbcPanel) {
    reportV2 = reportRepo.create({
      id: REPORT_V2_ID,
      labId: PILOT_LAB_ID,
      patientId: PATIENT_RAJESH_ID,
      refByDoctorId: DOCTOR_MEHRA_ID,
      reportNumber: 'R-20260924-0001',
      status: ReportStatusEnum.FINALIZED,
      sampleStatus: SampleStatusEnum.COMPLETED,
      sampleCollectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resultsEnteredAt: new Date(Date.now() - 60 * 60 * 1000),
      finalizedAt: new Date(Date.now() - 45 * 60 * 1000),
      shareToken: '9dd27607bd6bd4856aab57bcb5612d22d7981e275eff45871d662106f2f12073',
      remarks: 'Follow-up post 30 days iron supplementation. Hemoglobin demonstrates positive trajectory (+1.4 g/dL). Advised to continue current regimen for 4 more weeks.',
    });
    await reportRepo.save(reportV2);

    await reportPanelRepo.save(
      reportPanelRepo.create({
        reportId: REPORT_V2_ID,
        panelId: cbcPanel.id,
      }),
    );

    const allParams = cbcPanel.sections?.flatMap((s) => s.parameters || []) || [];
    const followUpValues: Record<string, { val: string; flag: boolean }> = {
      'Hemoglobin (Hb)': { val: '11.2', flag: true },
      'Total Leukocyte Count (TLC)': { val: '7400', flag: false },
      'Platelet Count': { val: '2.4', flag: false },
      'Packed Cell Volume (PCV)': { val: '36.5', flag: true },
      'Mean Corpuscular Volume (MCV)': { val: '76.0', flag: true },
      'Mean Corpuscular Hemoglobin (MCH)': { val: '23.3', flag: true },
      'MCHC': { val: '30.6', flag: true },
      'RDW-CV': { val: '16.2', flag: true },
      'Erythrocyte Sedimentation Rate (ESR)': { val: '22', flag: true },
    };

    for (const p of allParams) {
      const match = followUpValues[p.name];
      if (match) {
        await reportValueRepo.save(
          reportValueRepo.create({
            reportId: REPORT_V2_ID,
            parameterId: p.id,
            value: match.val,
            isOutOfRange: match.flag,
          }),
        );
      }
    }
    logger.log('Seeded current follow-up report (R-20260924-0001) for Rajesh Kumar.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. INVOICES & REVENUE
  // ───────────────────────────────────────────────────────────────────────────
  const INV_01_ID = '7cdae179-07e7-4f76-81e0-a93b5f55e5e5';
  let inv01 = await invoiceRepo.findOne({ where: { id: INV_01_ID } });
  if (!inv01) {
    inv01 = invoiceRepo.create({
      id: INV_01_ID,
      labId: PILOT_LAB_ID,
      patientId: PATIENT_RAJESH_ID,
      reportId: REPORT_V2_ID,
      invoiceNumber: 'INV-2026-0001',
      subtotal: 1000,
      discount: 0,
      totalAmount: 1000,
      paidAmount: 1000,
      paymentStatus: PaymentStatusEnum.PAID,
      paymentMethod: PaymentMethodEnum.UPI,
      paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      notes: 'Paid via PhonePe UPI. Ref: UPI/62918841029',
    });
    await invoiceRepo.save(inv01);

    await invoiceItemRepo.save([
      invoiceItemRepo.create({
        invoiceId: INV_01_ID,
        description: 'Complete Blood Count (CBC) with ESR',
        unitPrice: 350,
        quantity: 1,
        total: 350,
      }),
      invoiceItemRepo.create({
        invoiceId: INV_01_ID,
        description: 'Kidney Function Test (KFT / RFT with Electrolytes)',
        unitPrice: 650,
        quantity: 1,
        total: 650,
      }),
    ]);
    logger.log('Seeded invoice INV-2026-0001.');
  }

  const INV_02_ID = '7cdae179-07e7-4f76-81e0-a93b5f55e5e6';
  let inv02 = await invoiceRepo.findOne({ where: { id: INV_02_ID } });
  if (!inv02) {
    inv02 = invoiceRepo.create({
      id: INV_02_ID,
      labId: PILOT_LAB_ID,
      patientId: PATIENT_SUNITA_ID,
      invoiceNumber: 'INV-2026-0002',
      subtotal: 350,
      discount: 0,
      totalAmount: 350,
      paidAmount: 350,
      paymentStatus: PaymentStatusEnum.PAID,
      paymentMethod: PaymentMethodEnum.CASH,
      paidAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      notes: 'Cash in register voucher #8849',
    });
    await invoiceRepo.save(inv02);

    await invoiceItemRepo.save(
      invoiceItemRepo.create({
        invoiceId: INV_02_ID,
        description: 'Urine Routine & Microscopic Examination',
        unitPrice: 350,
        quantity: 1,
        total: 350,
      }),
    );
    logger.log('Seeded invoice INV-2026-0002.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. OPERATING EXPENSES (REAGENTS, TUBES, CALIBRATION, COURIER, UTILITIES)
  // ───────────────────────────────────────────────────────────────────────────
  const expensesToSeed = [
    {
      id: 'd1010000-0000-0000-0000-000000000001',
      category: ExpenseCategoryEnum.REAGENTS,
      title: 'Sysmex Cellpack DCL & Fluorocell Lyse Reagent Pack (20L)',
      amount: 4200.0,
      expenseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paymentMethod: PaymentMethodEnum.UPI,
      vendor: 'Transasia Bio-Medicals Ltd (North Hub)',
      vendorInvoiceNumber: 'INV-TAB-98412',
      notes: 'Monthly batch reagents for automated 5-part differential analyzer.',
    },
    {
      id: 'd1010000-0000-0000-0000-000000000002',
      category: ExpenseCategoryEnum.CONSUMABLES,
      title: 'BD Vacutainer EDTA Purple (100 pcs) + SST Gel Yellow (100 pcs)',
      amount: 1850.0,
      expenseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paymentMethod: PaymentMethodEnum.CASH,
      vendor: 'Ambala Surgical & Diagnostics Store',
      vendorInvoiceNumber: 'BILL-4190',
      notes: 'Phlebotomy blood collection tubes with barcode labels.',
    },
    {
      id: 'd1010000-0000-0000-0000-000000000003',
      category: ExpenseCategoryEnum.MAINTENANCE,
      title: 'Semi-Automated Biochemistry Analyzer 6-Month Optical Calibration',
      amount: 2500.0,
      expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paymentMethod: PaymentMethodEnum.UPI,
      vendor: 'Erba Mannheim Technical Services',
      vendorInvoiceNumber: 'SRV-88491',
      notes: 'Photometer optical zero filter recalibration certificate issued.',
    },
    {
      id: 'd1010000-0000-0000-0000-000000000004',
      category: ExpenseCategoryEnum.OTHER,
      title: 'BlueDart Medical Express Dispatch (Ambala Cantt Hub)',
      amount: 400.0,
      expenseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      paymentMethod: PaymentMethodEnum.CASH,
      vendor: 'Blue Dart Express Barara',
      vendorInvoiceNumber: 'AWB-BD-88492091',
      notes: 'Outsourced Vitamin D sample cold box priority courier.',
    },
    {
      id: 'd1010000-0000-0000-0000-000000000005',
      category: ExpenseCategoryEnum.UTILITIES,
      title: 'Laboratory Cold Chain & Generator Fuel (Diesel 15L)',
      amount: 1500.0,
      expenseDate: new Date(),
      paymentMethod: PaymentMethodEnum.CASH,
      vendor: 'Barara Fuel Station',
      vendorInvoiceNumber: 'PET-29104',
      notes: 'Backup generator running diesel during afternoon load shedding.',
    },
  ];

  for (const exp of expensesToSeed) {
    const existing = await expenseRepo.findOne({ where: { id: exp.id } });
    if (!existing) {
      await expenseRepo.save(
        expenseRepo.create({
          ...exp,
          labId: PILOT_LAB_ID,
        }),
      );
    }
  }
  logger.log(`Verified ${expensesToSeed.length} operating expense entries.`);

  // ───────────────────────────────────────────────────────────────────────────
  // 9. OUTSOURCED SEND-OUT TESTS
  // ───────────────────────────────────────────────────────────────────────────
  const outsourcedList = [
    {
      id: 'b1010000-0000-0000-0000-000000000001',
      reportId: REPORT_V2_ID,
      testName: '25-OH Vitamin D Total (CLIA)',
      referenceLabName: 'Dr. Lal PathLabs (Ambala Cantt Hub)',
      status: OutsourcedTestStatusEnum.SENT,
      cost: 400,
      notes: 'Carrier: Blue Dart Express. Tracking: BD-88492091. Cold pack enclosed.',
    },
    {
      id: 'b1010000-0000-0000-0000-000000000002',
      reportId: REPORT_V2_ID,
      testName: 'Histopathology — Skin Punch Biopsy (H&E)',
      referenceLabName: 'SRL Diagnostics Regional Reference Lab',
      status: OutsourcedTestStatusEnum.PENDING,
      cost: 750,
      notes: 'Specimen in 10% neutral formalin. Scheduled for courier pickup.',
    },
    {
      id: 'b1010000-0000-0000-0000-000000000003',
      reportId: REPORT_V2_ID,
      testName: 'Thyroid Peroxidase Antibodies (Anti-TPO)',
      referenceLabName: 'Thyrocare Technologies Limited',
      status: OutsourcedTestStatusEnum.RECEIVED,
      cost: 320,
      notes: 'Result received: 14.2 IU/mL (Negative). Merged into master electronic chart.',
    },
  ];

  for (const out of outsourcedList) {
    const existing = await outsourcedRepo.findOne({ where: { id: out.id } });
    if (!existing) {
      await outsourcedRepo.save(
        outsourcedRepo.create({
          ...out,
          labId: PILOT_LAB_ID,
        }),
      );
    }
  }
  logger.log('Verified outsourced send-outs.');

  // ───────────────────────────────────────────────────────────────────────────
  // 10. DOCTOR COMMISSION LEDGER RECORDS
  // ───────────────────────────────────────────────────────────────────────────
  const ledgerEntries = [
    {
      id: 'a1010000-0000-0000-0000-000000000001',
      doctorId: DOCTOR_MEHRA_ID,
      reportId: REPORT_V2_ID,
      amount: 100,
      status: CommissionStatusEnum.PENDING,
      notes: '10% on CBC (₹350) + KFT (₹650) for Rajesh Kumar (#R-20260924-0001)',
    },
    {
      id: 'a1010000-0000-0000-0000-000000000002',
      doctorId: DOCTOR_MEHRA_ID,
      reportId: null,
      amount: 350,
      status: CommissionStatusEnum.SETTLED,
      settledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      notes: 'Settled via NEFT Ref: N384910219 (TDS 194H compliant)',
    },
    {
      id: 'a1010000-0000-0000-0000-000000000003',
      doctorId: DOCTOR_GUPTA_ID,
      reportId: null,
      amount: 450,
      status: CommissionStatusEnum.PENDING,
      notes: '15% on Antenatal Screening panels',
    },
    {
      id: 'a1010000-0000-0000-0000-000000000004',
      doctorId: DOCTOR_SETHI_ID,
      reportId: null,
      amount: 400,
      status: CommissionStatusEnum.PENDING,
      notes: 'Flat ₹200/pt for 2 Ortho cases',
    },
  ];

  for (const led of ledgerEntries) {
    const existing = await ledgerRepo.findOne({ where: { id: led.id } });
    if (!existing) {
      await ledgerRepo.save(
        ledgerRepo.create({
          ...led,
          labId: PILOT_LAB_ID,
        }),
      );
    }
  }
  logger.log('Verified doctor commission ledger.');

  // ───────────────────────────────────────────────────────────────────────────
  // 11. HOME COLLECTIONS / PHLEBOTOMY WORKSTATION
  // ───────────────────────────────────────────────────────────────────────────
  const collections = [
    {
      id: 'f2010000-0000-0000-0000-000000000001',
      requestNumber: 'HC-2026-0001',
      patientId: PATIENT_RAJESH_ID,
      patientName: 'Rajesh Kumar',
      patientPhone: '+919876543210',
      patientAge: '45 Y',
      patientSex: SexEnum.MALE,
      address: 'Ward 4, Near Water Tank, Barara (Opposite Mehra Hospital)',
      preferredDate: new Date(),
      timeSlot: '07:30 AM - 08:30 AM',
      status: CollectionStatusEnum.REQUESTED,
      notes: 'Fasting blood draw for repeat Blood Sugar & Lipid Profile.',
    },
    {
      id: 'f2010000-0000-0000-0000-000000000002',
      requestNumber: 'HC-2026-0002',
      patientId: null,
      patientName: 'Smt. Shakuntala Devi',
      patientPhone: '+919416233412',
      patientAge: '82 Y',
      patientSex: SexEnum.FEMALE,
      address: 'House #14, Railway Road, Barara',
      preferredDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      timeSlot: '06:30 AM - 07:30 AM',
      status: CollectionStatusEnum.SAMPLE_COLLECTED,
      notes: 'Bedridden geriatric patient. Complete hemogram and serum electrolytes collected.',
    },
  ];

  for (const c of collections) {
    const existing = await collectionRepo.findOne({ where: { id: c.id } });
    if (!existing) {
      await collectionRepo.save(
        collectionRepo.create({
          ...c,
          labId: PILOT_LAB_ID,
        }),
      );
    }
  }
  logger.log('Verified home collection bookings.');

  // ───────────────────────────────────────────────────────────────────────────
  // 12. NOTIFICATION DISPATCH TELEMETRY
  // ───────────────────────────────────────────────────────────────────────────
  const notifLogs = [
    {
      id: 'e1010000-0000-0000-0000-000000000001',
      recipientType: RecipientTypeEnum.PATIENT,
      recipientName: 'Rajesh Kumar',
      destination: '+919876543210',
      channel: NotificationChannelEnum.WHATSAPP,
      notificationType: NotificationTypeEnum.REPORT_READY,
      status: NotificationStatusEnum.READ,
      messageContent: 'Dear Rajesh Kumar, Your diagnostic report (#R-20260924-0001) from Deswal Diagnostic Laboratory is now ready. View report securely: http://localhost:3000/v/9dd27607bd6bd4856aab57bcb5612d22d7981e275eff45871d662106f2f12073',
      payload: {
        reportId: REPORT_V2_ID,
        reportNumber: 'R-20260924-0001',
        shareToken: '9dd27607bd6bd4856aab57bcb5612d22d7981e275eff45871d662106f2f12073',
      },
      provider: 'whatsapp_cloud',
      sentAt: new Date(Date.now() - 45 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 43 * 60 * 1000),
    },
    {
      id: 'e1010000-0000-0000-0000-000000000002',
      recipientType: RecipientTypeEnum.DOCTOR,
      recipientName: 'Dr. A. K. Mehra',
      destination: '+919811234567',
      channel: NotificationChannelEnum.WHATSAPP,
      notificationType: NotificationTypeEnum.REPORT_READY,
      status: NotificationStatusEnum.DELIVERED,
      messageContent: 'Dr. A. K. Mehra, report for referred patient Rajesh Kumar (#R-20260924-0001) is authorized and ready for review: http://localhost:3000/v/9dd27607bd6bd4856aab57bcb5612d22d7981e275eff45871d662106f2f12073',
      payload: {
        reportId: REPORT_V2_ID,
        doctorId: DOCTOR_MEHRA_ID,
      },
      provider: 'whatsapp_cloud',
      sentAt: new Date(Date.now() - 42 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 40 * 60 * 1000),
    },
    {
      id: 'e1010000-0000-0000-0000-000000000003',
      recipientType: RecipientTypeEnum.PATIENT,
      recipientName: 'Rajesh Kumar',
      destination: '+919876543210',
      channel: NotificationChannelEnum.SMS,
      notificationType: NotificationTypeEnum.PAYMENT_RECEIPT,
      status: NotificationStatusEnum.DELIVERED,
      messageContent: 'Deswal Diagnostic Lab: Received Rs. 1000 via UPI for Invoice #INV-2026-0001. Thank you!',
      payload: { invoiceNumber: 'INV-2026-0001', amount: 1000 },
      provider: 'msg91',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ];

  for (const n of notifLogs) {
    const existing = await notifRepo.findOne({ where: { id: n.id } });
    if (!existing) {
      await notifRepo.save(
        notifRepo.create({
          ...n,
          labId: PILOT_LAB_ID,
        }),
      );
    }
  }
  logger.log('Verified notification dispatch logs.');

  logger.log('Pilot tenant idempotent seeding completed successfully!');
}
