import { DataSource } from 'typeorm';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';

export const defaultTemplates = [
  // 1. HEMATOLOGY & HEMOGRAM
  {
    name: 'Complete Blood Count (CBC) with ESR',
    category: 'Hematology',
    description: 'Complete hemogram with automated 5-part differential, red cell indices & Westergren ESR',
    defaultPrice: 350.0,
    templateData: {
      sections: [
        {
          name: 'I. Hemogram & Cellular Indices',
          sortOrder: 1,
          parameters: [
            {
              name: 'Hemoglobin (Hb)',
              nameLocal: 'हीमोग्लोबिन',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'Cyanmethemoglobin / SLS-Hemoglobin',
              normalRange: {
                type: 'gender_specific',
                male: { min: 13.0, max: 17.0 },
                female: { min: 12.0, max: 15.5 },
                panicLow: 7.0,
                panicHigh: 20.0,
              },
              sortOrder: 1,
            },
            {
              name: 'Total Leukocyte Count (TLC)',
              nameLocal: 'सफेद रक्त कोशिकाएं',
              unit: '/cumm',
              inputType: 'NUMBER',
              method: 'Flow Cytometry / Direct Impedance',
              normalRange: {
                type: 'numeric',
                min: 4000,
                max: 11000,
                panicLow: 2000,
                panicHigh: 30000,
              },
              sortOrder: 2,
            },
            {
              name: 'Platelet Count',
              nameLocal: 'प्लेटलेट्स',
              unit: 'lakh/cumm',
              inputType: 'NUMBER',
              method: 'Direct Impedance',
              normalRange: {
                type: 'numeric',
                min: 1.5,
                max: 4.5,
                panicLow: 0.5,
                panicHigh: 10.0,
              },
              sortOrder: 3,
            },
            {
              name: 'RBC Count',
              nameLocal: 'लाल रक्त कोशिकाएं',
              unit: 'million/cumm',
              inputType: 'NUMBER',
              method: 'Direct Impedance',
              normalRange: {
                type: 'gender_specific',
                male: { min: 4.5, max: 5.5 },
                female: { min: 4.0, max: 5.0 },
              },
              sortOrder: 4,
            },
            {
              name: 'Packed Cell Volume (PCV)',
              unit: '%',
              inputType: 'NUMBER',
              method: 'Calculated / Centrifuged',
              normalRange: {
                type: 'gender_specific',
                male: { min: 40.0, max: 50.0 },
                female: { min: 36.0, max: 46.0 },
              },
              sortOrder: 5,
            },
            {
              name: 'Mean Corpuscular Volume (MCV)',
              unit: 'fL',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 80.0, max: 100.0 },
              sortOrder: 6,
            },
            {
              name: 'Mean Corpuscular Hemoglobin (MCH)',
              unit: 'pg',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 27.0, max: 32.0 },
              sortOrder: 7,
            },
            {
              name: 'Mean Corpuscular Hb Conc (MCHC)',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 32.0, max: 36.0 },
              sortOrder: 8,
            },
            {
              name: 'Red Cell Distribution Width (RDW-CV)',
              unit: '%',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 11.5, max: 14.5 },
              sortOrder: 9,
            },
          ],
        },
        {
          name: 'II. Differential Leukocyte Count (DLC)',
          sortOrder: 2,
          parameters: [
            {
              name: 'Neutrophils',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 40, max: 70 },
              sortOrder: 1,
            },
            {
              name: 'Lymphocytes',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 20, max: 45 },
              sortOrder: 2,
            },
            {
              name: 'Eosinophils',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 1, max: 6 },
              sortOrder: 3,
            },
            {
              name: 'Monocytes',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 2, max: 10 },
              sortOrder: 4,
            },
            {
              name: 'Basophils',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 0, max: 1 },
              sortOrder: 5,
            },
          ],
        },
        {
          name: 'III. Sedimentation Rate & Smear',
          sortOrder: 3,
          parameters: [
            {
              name: 'ESR (Erythrocyte Sedimentation Rate)',
              nameLocal: 'ईएसआर',
              unit: 'mm/1st hr',
              inputType: 'NUMBER',
              method: 'Westergren Method',
              normalRange: {
                type: 'gender_specific',
                male: { min: 0, max: 15 },
                female: { min: 0, max: 20 },
              },
              sortOrder: 1,
            },
            {
              name: 'Peripheral Smear Examination',
              inputType: 'TEXT',
              method: 'Leishman Stain Microscopy',
              normalRange: { type: 'text', text: 'Normocytic Normochromic' },
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    category: 'Hematology',
    description: 'Non-specific marker for systemic inflammation and tissue infection',
    defaultPrice: 80.0,
    templateData: {
      sections: [
        {
          name: 'Sedimentation Rate',
          sortOrder: 1,
          parameters: [
            {
              name: 'ESR (1st Hour)',
              unit: 'mm/hr',
              inputType: 'NUMBER',
              method: 'Westergren Method',
              normalRange: {
                type: 'gender_specific',
                male: { min: 0, max: 15 },
                female: { min: 0, max: 20 },
              },
              sortOrder: 1,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Blood Grouping & Rh Factor',
    category: 'Hematology',
    description: 'Determination of ABO blood group and Rh(D) factor for transfusion safety',
    defaultPrice: 100.0,
    templateData: {
      sections: [
        {
          name: 'ABO & Rh Typing',
          sortOrder: 1,
          parameters: [
            {
              name: 'ABO Blood Group',
              inputType: 'DROPDOWN',
              options: ['"A" Group', '"B" Group', '"AB" Group', '"O" Group'],
              method: 'Slide & Tube Agglutination',
              sortOrder: 1,
            },
            {
              name: 'Rh (D) Factor',
              inputType: 'DROPDOWN',
              options: ['Positive (+)', 'Negative (-)'],
              method: 'Monoclonal Anti-D Agglutination',
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Prothrombin Time & INR (PT / INR)',
    category: 'Hematology',
    description: 'Extrinsic coagulation cascade monitoring for oral anticoagulant therapy',
    defaultPrice: 300.0,
    templateData: {
      sections: [
        {
          name: 'Coagulation Parameters',
          sortOrder: 1,
          parameters: [
            {
              name: 'Patient Prothrombin Time',
              unit: 'seconds',
              inputType: 'NUMBER',
              method: 'Neoplastin / Coagulometer',
              normalRange: { type: 'numeric', min: 11.0, max: 15.0 },
              sortOrder: 1,
            },
            {
              name: 'Control Prothrombin Time',
              unit: 'seconds',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 11.0, max: 13.0 },
              sortOrder: 2,
            },
            {
              name: 'International Normalized Ratio (INR)',
              unit: 'ratio',
              inputType: 'NUMBER',
              normalRange: {
                type: 'numeric',
                min: 0.8,
                max: 1.2,
                panicHigh: 4.5,
              },
              sortOrder: 3,
            },
          ],
        },
      ],
    },
  },

  // 2. BIOCHEMISTRY & METABOLISM
  {
    name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    description: 'Comprehensive hepatic enzymes, bilirubin fractions, total protein and albumin ratio',
    defaultPrice: 650.0,
    templateData: {
      sections: [
        {
          name: 'Bilirubin Fractions',
          sortOrder: 1,
          parameters: [
            {
              name: 'Bilirubin Total',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Diazo / Jendrassik-Grof',
              normalRange: { type: 'numeric', min: 0.2, max: 1.2 },
              sortOrder: 1,
            },
            {
              name: 'Bilirubin Direct (Conjugated)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Diazo Method',
              normalRange: { type: 'numeric', min: 0.0, max: 0.3 },
              sortOrder: 2,
            },
            {
              name: 'Bilirubin Indirect (Unconjugated)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 0.2, max: 0.9 },
              sortOrder: 3,
            },
          ],
        },
        {
          name: 'Hepatic Enzymes & Proteins',
          sortOrder: 2,
          parameters: [
            {
              name: 'SGOT / AST (Aspartate Aminotransferase)',
              unit: 'U/L',
              inputType: 'NUMBER',
              method: 'UV Kinetic (IFCC)',
              normalRange: { type: 'numeric', min: 5, max: 40 },
              sortOrder: 1,
            },
            {
              name: 'SGPT / ALT (Alanine Aminotransferase)',
              unit: 'U/L',
              inputType: 'NUMBER',
              method: 'UV Kinetic (IFCC)',
              normalRange: { type: 'numeric', min: 5, max: 45 },
              sortOrder: 2,
            },
            {
              name: 'Alkaline Phosphatase (ALP)',
              unit: 'U/L',
              inputType: 'NUMBER',
              method: 'p-NPP Kinetic',
              normalRange: { type: 'numeric', min: 30, max: 120 },
              sortOrder: 3,
            },
            {
              name: 'Total Protein',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'Biuret Method',
              normalRange: { type: 'numeric', min: 6.0, max: 8.3 },
              sortOrder: 4,
            },
            {
              name: 'Serum Albumin',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'Bromocresol Green (BCG)',
              normalRange: { type: 'numeric', min: 3.5, max: 5.0 },
              sortOrder: 5,
            },
            {
              name: 'Serum Globulin',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 2.0, max: 3.5 },
              sortOrder: 6,
            },
            {
              name: 'A/G Ratio',
              unit: 'ratio',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 1.2, max: 2.2 },
              sortOrder: 7,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Kidney Function Test (KFT / RFT with Electrolytes)',
    category: 'Biochemistry',
    description: 'Renal clearance markers including Blood Urea, Serum Creatinine, Uric Acid & Electrolytes',
    defaultPrice: 650.0,
    templateData: {
      sections: [
        {
          name: 'Renal Excretory Markers',
          sortOrder: 1,
          parameters: [
            {
              name: 'Blood Urea',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'GLDH Kinetic',
              normalRange: { type: 'numeric', min: 15, max: 45 },
              sortOrder: 1,
            },
            {
              name: 'Blood Urea Nitrogen (BUN)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 7, max: 20 },
              sortOrder: 2,
            },
            {
              name: 'Serum Creatinine',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Modified Jaffe Kinetic',
              normalRange: {
                type: 'gender_specific',
                male: { min: 0.7, max: 1.3 },
                female: { min: 0.6, max: 1.1 },
                panicHigh: 4.0,
              },
              sortOrder: 3,
            },
            {
              name: 'Serum Uric Acid',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Uricase Enzymatic',
              normalRange: {
                type: 'gender_specific',
                male: { min: 3.4, max: 7.2 },
                female: { min: 2.4, max: 6.0 },
              },
              sortOrder: 4,
            },
          ],
        },
        {
          name: 'Serum Electrolytes',
          sortOrder: 2,
          parameters: [
            {
              name: 'Serum Sodium (Na+)',
              unit: 'mmol/L',
              inputType: 'NUMBER',
              method: 'Ion Selective Electrode (ISE)',
              normalRange: { type: 'numeric', min: 135, max: 145 },
              sortOrder: 1,
            },
            {
              name: 'Serum Potassium (K+)',
              unit: 'mmol/L',
              inputType: 'NUMBER',
              method: 'Ion Selective Electrode (ISE)',
              normalRange: { type: 'numeric', min: 3.5, max: 5.1 },
              sortOrder: 2,
            },
            {
              name: 'Serum Chloride (Cl-)',
              unit: 'mmol/L',
              inputType: 'NUMBER',
              method: 'Ion Selective Electrode (ISE)',
              normalRange: { type: 'numeric', min: 96, max: 106 },
              sortOrder: 3,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Comprehensive Lipid Profile',
    category: 'Biochemistry',
    description: 'Cardiovascular lipid risk assessment: Cholesterol, Triglycerides, HDL, LDL, VLDL',
    defaultPrice: 550.0,
    templateData: {
      sections: [
        {
          name: 'Lipid Panel',
          sortOrder: 1,
          parameters: [
            {
              name: 'Total Cholesterol',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'CHOD-PAP Enzymatic',
              normalRange: { type: 'numeric', min: 125, max: 200 },
              sortOrder: 1,
            },
            {
              name: 'Serum Triglycerides',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'GPO-PAP Enzymatic',
              normalRange: { type: 'numeric', min: 50, max: 150 },
              sortOrder: 2,
            },
            {
              name: 'HDL Cholesterol (Good)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Direct Immunoinhibition',
              normalRange: { type: 'numeric', min: 40, max: 60 },
              sortOrder: 3,
            },
            {
              name: 'LDL Cholesterol (Calculated)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Friedewald Formula',
              normalRange: { type: 'numeric', min: 50, max: 100 },
              sortOrder: 4,
            },
            {
              name: 'VLDL Cholesterol',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 10, max: 30 },
              sortOrder: 5,
            },
            {
              name: 'Cholesterol / HDL Ratio',
              unit: 'ratio',
              inputType: 'NUMBER',
              method: 'Calculated',
              normalRange: { type: 'numeric', min: 3.0, max: 5.0 },
              sortOrder: 6,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Blood Glucose (Fasting & Post-Prandial)',
    category: 'Biochemistry',
    description: 'Diagnostic diabetic screen measuring fasting and 2-hour post-meal plasma glucose',
    defaultPrice: 120.0,
    templateData: {
      sections: [
        {
          name: 'Glycemic Parameters',
          sortOrder: 1,
          parameters: [
            {
              name: 'Fasting Plasma Glucose (FBS)',
              nameLocal: 'फास्टिंग ब्लड शुगर',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'GOD-POD Enzymatic',
              normalRange: {
                type: 'numeric',
                min: 70,
                max: 99,
                panicLow: 50,
                panicHigh: 400,
              },
              sortOrder: 1,
            },
            {
              name: 'Post-Prandial Blood Sugar (PPBS)',
              nameLocal: 'खाना खाने के बाद ब्लड शुगर',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'GOD-POD Enzymatic',
              normalRange: {
                type: 'numeric',
                min: 70,
                max: 140,
                panicHigh: 400,
              },
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Glycated Hemoglobin (HbA1c)',
    category: 'Biochemistry',
    description: '3-month average glycemic control index via HPLC method (NGSP certified)',
    defaultPrice: 450.0,
    templateData: {
      sections: [
        {
          name: 'Glycated Hemoglobin',
          sortOrder: 1,
          parameters: [
            {
              name: 'HbA1c (Glycated Hb)',
              nameLocal: 'एचबीए1सी',
              unit: '%',
              inputType: 'NUMBER',
              method: 'Ion-Exchange HPLC / Turbidimetry',
              normalRange: {
                type: 'numeric',
                min: 4.0,
                max: 5.6,
                panicHigh: 12.0,
              },
              sortOrder: 1,
            },
            {
              name: 'Estimated Average Glucose (eAG)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Calculated (28.7 x HbA1c - 46.7)',
              normalRange: { type: 'numeric', min: 70, max: 115 },
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Serum Calcium & Phosphorus',
    category: 'Biochemistry',
    description: 'Mineral bone metabolism screen for hypocalcemia, tetany and renal osteodystrophy',
    defaultPrice: 250.0,
    templateData: {
      sections: [
        {
          name: 'Mineral Homeostasis',
          sortOrder: 1,
          parameters: [
            {
              name: 'Serum Total Calcium',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Arsenazo III',
              normalRange: { type: 'numeric', min: 8.5, max: 10.5 },
              sortOrder: 1,
            },
            {
              name: 'Serum Inorganic Phosphorus',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Phosphomolybdate UV',
              normalRange: { type: 'numeric', min: 2.5, max: 4.5 },
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Serum Amylase & Lipase',
    category: 'Biochemistry',
    description: 'Pancreatic enzyme markers for acute pancreatitis and abdominal pain evaluation',
    defaultPrice: 700.0,
    templateData: {
      sections: [
        {
          name: 'Pancreatic Enzymes',
          sortOrder: 1,
          parameters: [
            {
              name: 'Serum Amylase',
              unit: 'U/L',
              inputType: 'NUMBER',
              method: 'CNPG3 Substrate Kinetic',
              normalRange: { type: 'numeric', min: 28, max: 100 },
              sortOrder: 1,
            },
            {
              name: 'Serum Lipase',
              unit: 'U/L',
              inputType: 'NUMBER',
              method: 'Enzymatic Colorimetric',
              normalRange: { type: 'numeric', min: 13, max: 60 },
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  },

  // 3. CLINICAL PATHOLOGY
  {
    name: 'Urine Routine & Microscopic Examination',
    category: 'Clinical Pathology',
    description: 'Complete physical, chemical strip and microscopic sediment examination of urine',
    defaultPrice: 150.0,
    templateData: {
      sections: [
        {
          name: 'I. Physical Examination',
          sortOrder: 1,
          parameters: [
            {
              name: 'Colour',
              inputType: 'DROPDOWN',
              options: ['Pale Yellow', 'Yellow', 'Straw', 'Amber', 'Reddish', 'Turbid'],
              normalRange: { type: 'text', text: 'Pale Yellow' },
              sortOrder: 1,
            },
            {
              name: 'Appearance',
              inputType: 'DROPDOWN',
              options: ['Clear', 'Hazy', 'Turbid', 'Cloudy'],
              normalRange: { type: 'text', text: 'Clear' },
              sortOrder: 2,
            },
            {
              name: 'Specific Gravity',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 1.005, max: 1.03 },
              sortOrder: 3,
            },
          ],
        },
        {
          name: 'II. Chemical Examination',
          sortOrder: 2,
          parameters: [
            {
              name: 'Reaction (pH)',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 4.5, max: 8.0 },
              sortOrder: 1,
            },
            {
              name: 'Urine Albumin / Protein',
              inputType: 'DROPDOWN',
              options: ['Nil / Negative', 'Trace', '1+ (30 mg/dL)', '2+ (100 mg/dL)', '3+ (300 mg/dL)', '4+ (1000 mg/dL)'],
              normalRange: { type: 'text', text: 'Nil / Negative' },
              sortOrder: 2,
            },
            {
              name: 'Urine Sugar (Glucose)',
              inputType: 'DROPDOWN',
              options: ['Nil / Negative', 'Trace', '1+ (0.5%)', '2+ (1.0%)', '3+ (2.0%)', '4+ (5.0%)'],
              normalRange: { type: 'text', text: 'Nil / Negative' },
              sortOrder: 3,
            },
            {
              name: 'Ketone Bodies (Acetone)',
              inputType: 'DROPDOWN',
              options: ['Negative', 'Trace', 'Positive (+)'],
              normalRange: { type: 'text', text: 'Negative' },
              sortOrder: 4,
            },
            {
              name: 'Bile Salts',
              inputType: 'DROPDOWN',
              options: ['Negative', 'Positive (+)'],
              normalRange: { type: 'text', text: 'Negative' },
              sortOrder: 5,
            },
            {
              name: 'Bile Pigments',
              inputType: 'DROPDOWN',
              options: ['Negative', 'Positive (+)'],
              normalRange: { type: 'text', text: 'Negative' },
              sortOrder: 6,
            },
          ],
        },
        {
          name: 'III. Microscopic Examination',
          sortOrder: 3,
          parameters: [
            {
              name: 'Pus Cells (Leukocytes)',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: '0-5 /HPF' },
              sortOrder: 1,
            },
            {
              name: 'Red Blood Cells (RBCs)',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: 'Nil /HPF' },
              sortOrder: 2,
            },
            {
              name: 'Epithelial Cells',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: 'Occasional (2-5) /HPF' },
              sortOrder: 3,
            },
            {
              name: 'Casts',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: 'Nil' },
              sortOrder: 4,
            },
            {
              name: 'Crystals',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: 'Nil / Occasional' },
              sortOrder: 5,
            },
            {
              name: 'Bacteria',
              inputType: 'DROPDOWN',
              options: ['Absent', 'Few', 'Moderate', 'Plenty'],
              normalRange: { type: 'text', text: 'Absent' },
              sortOrder: 6,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Stool Routine & Occult Blood',
    category: 'Clinical Pathology',
    description: 'Macroscopic and microscopic stool analysis for intestinal parasites and occult bleed',
    defaultPrice: 150.0,
    templateData: {
      sections: [
        {
          name: 'Stool Analysis',
          sortOrder: 1,
          parameters: [
            {
              name: 'Colour',
              inputType: 'DROPDOWN',
              options: ['Brown', 'Yellowish', 'Clay', 'Dark/Tarry', 'Greenish'],
              normalRange: { type: 'text', text: 'Brown' },
              sortOrder: 1,
            },
            {
              name: 'Consistency',
              inputType: 'DROPDOWN',
              options: ['Formed', 'Semi-formed', 'Loose', 'Watery'],
              normalRange: { type: 'text', text: 'Formed' },
              sortOrder: 2,
            },
            {
              name: 'Occult Blood (OB)',
              inputType: 'DROPDOWN',
              options: ['Negative', 'Positive (+)'],
              normalRange: { type: 'text', text: 'Negative' },
              sortOrder: 3,
            },
            {
              name: 'Ova / Cysts / Parasites',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: 'None seen' },
              sortOrder: 4,
            },
            {
              name: 'Pus Cells',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: '0-2 /HPF' },
              sortOrder: 5,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Semen Analysis & Morphology',
    category: 'Clinical Pathology',
    description: 'Comprehensive seminal fluid evaluation (WHO 6th Edition criteria)',
    defaultPrice: 400.0,
    templateData: {
      sections: [
        {
          name: 'Physical Examination',
          sortOrder: 1,
          parameters: [
            {
              name: 'Volume',
              unit: 'mL',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 1.5, max: 5.0 },
              sortOrder: 1,
            },
            {
              name: 'Liquefaction Time',
              unit: 'minutes',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 15, max: 30 },
              sortOrder: 2,
            },
            {
              name: 'pH',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 7.2, max: 8.0 },
              sortOrder: 3,
            },
          ],
        },
        {
          name: 'Microscopic & Motility',
          sortOrder: 2,
          parameters: [
            {
              name: 'Total Sperm Concentration',
              unit: 'million/mL',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 15, max: 200 },
              sortOrder: 1,
            },
            {
              name: 'Progressive Motility (PR)',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 32, max: 100 },
              sortOrder: 2,
            },
            {
              name: 'Total Motility (PR + NP)',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 40, max: 100 },
              sortOrder: 3,
            },
            {
              name: 'Normal Forms (Morphology)',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 4, max: 100 },
              sortOrder: 4,
            },
            {
              name: 'Pus Cells',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: '0-4 /HPF' },
              sortOrder: 5,
            },
          ],
        },
      ],
    },
  },

  // 4. SEROLOGY & RAPID IMMUNOASSAYS
  {
    name: 'Widal Slide Agglutination (Enteric Fever)',
    category: 'Serology',
    description: 'Slide and tube agglutination antibody titre test for Salmonella enterica serovars',
    defaultPrice: 180.0,
    templateData: {
      sections: [
        {
          name: 'Salmonella Antibody Titres',
          sortOrder: 1,
          parameters: [
            {
              name: 'S. Typhi "O" Antigen Titre',
              inputType: 'DROPDOWN',
              options: ['< 1:80 (Negative)', '1:80', '1:160 (Positive)', '1:320 (Strongly Positive)'],
              normalRange: { type: 'text', text: '< 1:80 (Negative)' },
              sortOrder: 1,
            },
            {
              name: 'S. Typhi "H" Antigen Titre',
              inputType: 'DROPDOWN',
              options: ['< 1:80 (Negative)', '1:80', '1:160 (Positive)', '1:320 (Strongly Positive)'],
              normalRange: { type: 'text', text: '< 1:160 (Negative)' },
              sortOrder: 2,
            },
            {
              name: 'S. Paratyphi "AH" Titre',
              inputType: 'DROPDOWN',
              options: ['< 1:80 (Negative)', '1:80', '1:160 (Positive)'],
              normalRange: { type: 'text', text: '< 1:80 (Negative)' },
              sortOrder: 3,
            },
            {
              name: 'S. Paratyphi "BH" Titre',
              inputType: 'DROPDOWN',
              options: ['< 1:80 (Negative)', '1:80', '1:160 (Positive)'],
              normalRange: { type: 'text', text: '< 1:80 (Negative)' },
              sortOrder: 4,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Dengue Duo Rapid (NS1 Antigen + IgM/IgG)',
    category: 'Serology',
    description: 'Differential detection of Dengue NS1 antigen and IgM/IgG antibodies for acute & convalescent phase',
    defaultPrice: 600.0,
    templateData: {
      sections: [
        {
          name: 'Dengue Serological Markers',
          sortOrder: 1,
          parameters: [
            {
              name: 'Dengue NS1 Antigen',
              nameLocal: 'डेंगू एनएस1 एंटीजन',
              inputType: 'DROPDOWN',
              options: ['Negative (Non-Reactive)', 'Positive (Reactive)'],
              method: 'Rapid Immunochromatography',
              normalRange: { type: 'text', text: 'Negative (Non-Reactive)' },
              sortOrder: 1,
            },
            {
              name: 'Dengue IgM Antibodies',
              inputType: 'DROPDOWN',
              options: ['Negative (Non-Reactive)', 'Positive (Reactive)'],
              method: 'Rapid Immunochromatography',
              normalRange: { type: 'text', text: 'Negative (Non-Reactive)' },
              sortOrder: 2,
            },
            {
              name: 'Dengue IgG Antibodies',
              inputType: 'DROPDOWN',
              options: ['Negative (Non-Reactive)', 'Positive (Reactive)'],
              method: 'Rapid Immunochromatography',
              normalRange: { type: 'text', text: 'Negative (Non-Reactive)' },
              sortOrder: 3,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Malaria Antigen Rapid Card (Pv / Pf)',
    category: 'Serology',
    description: 'Rapid diagnostic card detecting Plasmodium vivax (Pv-LDH) and falciparum (Pf-HRP2) antigens',
    defaultPrice: 250.0,
    templateData: {
      sections: [
        {
          name: 'Plasmodium Antigens',
          sortOrder: 1,
          parameters: [
            {
              name: 'P. vivax Antigen (Pv-LDH)',
              inputType: 'DROPDOWN',
              options: ['Negative (Non-Reactive)', 'Positive (Reactive)'],
              normalRange: { type: 'text', text: 'Negative (Non-Reactive)' },
              sortOrder: 1,
            },
            {
              name: 'P. falciparum Antigen (Pf-HRP2)',
              inputType: 'DROPDOWN',
              options: ['Negative (Non-Reactive)', 'Positive (Reactive)'],
              normalRange: { type: 'text', text: 'Negative (Non-Reactive)' },
              sortOrder: 2,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'C-Reactive Protein (CRP Quantitative)',
    category: 'Serology',
    description: 'Acute phase inflammatory protein for bacterial infection and cardiovascular risk stratification',
    defaultPrice: 350.0,
    templateData: {
      sections: [
        {
          name: 'Acute Phase Reactant',
          sortOrder: 1,
          parameters: [
            {
              name: 'C-Reactive Protein (CRP)',
              unit: 'mg/L',
              inputType: 'NUMBER',
              method: 'Immunoturbidimetry',
              normalRange: { type: 'numeric', min: 0.0, max: 6.0 },
              sortOrder: 1,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Rheumatoid Factor (RA / RF Quantitative)',
    category: 'Serology',
    description: 'Quantitative autoantibody detection for Rheumatoid Arthritis diagnosis',
    defaultPrice: 350.0,
    templateData: {
      sections: [
        {
          name: 'Rheumatoid Factor',
          sortOrder: 1,
          parameters: [
            {
              name: 'Rheumatoid Factor (RF)',
              unit: 'IU/mL',
              inputType: 'NUMBER',
              method: 'Immunoturbidimetry / Latex Agglutination',
              normalRange: { type: 'numeric', min: 0.0, max: 20.0 },
              sortOrder: 1,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Viral Markers Screening (HIV, HBsAg, HCV)',
    category: 'Serology',
    description: 'Standard triple infectious blood screening for pre-operative and general health clearance',
    defaultPrice: 650.0,
    templateData: {
      sections: [
        {
          name: 'Infectious Viral Markers',
          sortOrder: 1,
          parameters: [
            {
              name: 'HIV 1 & 2 Antibodies',
              inputType: 'DROPDOWN',
              options: ['Non-Reactive', 'Reactive'],
              method: '3rd Gen Immunochromatographic Assay',
              normalRange: { type: 'text', text: 'Non-Reactive' },
              sortOrder: 1,
            },
            {
              name: 'Hepatitis B Surface Antigen (HBsAg)',
              inputType: 'DROPDOWN',
              options: ['Non-Reactive', 'Reactive'],
              method: 'Rapid Immunochromatography',
              normalRange: { type: 'text', text: 'Non-Reactive' },
              sortOrder: 2,
            },
            {
              name: 'HCV Antibodies (Hepatitis C)',
              inputType: 'DROPDOWN',
              options: ['Non-Reactive', 'Reactive'],
              method: 'Rapid Immunochromatography',
              normalRange: { type: 'text', text: 'Non-Reactive' },
              sortOrder: 3,
            },
          ],
        },
      ],
    },
  },

  // 5. ENDOCRINOLOGY & IMMUNOASSAY
  {
    name: 'Thyroid Profile Total (T3, T4, TSH)',
    category: 'Endocrinology',
    description: 'Complete endocrine evaluation of hypothalamic-pituitary-thyroid axis',
    defaultPrice: 450.0,
    templateData: {
      sections: [
        {
          name: 'Thyroid Hormones',
          sortOrder: 1,
          parameters: [
            {
              name: 'Total Triiodothyronine (T3)',
              unit: 'ng/mL',
              inputType: 'NUMBER',
              method: 'CLIA / ECLIA',
              normalRange: { type: 'numeric', min: 0.8, max: 2.0 },
              sortOrder: 1,
            },
            {
              name: 'Total Thyroxine (T4)',
              unit: 'µg/dL',
              inputType: 'NUMBER',
              method: 'CLIA / ECLIA',
              normalRange: { type: 'numeric', min: 5.1, max: 14.1 },
              sortOrder: 2,
            },
            {
              name: 'Thyroid Stimulating Hormone (TSH)',
              unit: 'µIU/mL',
              inputType: 'NUMBER',
              method: 'Ultra-Sensitive CLIA',
              normalRange: {
                type: 'numeric',
                min: 0.35,
                max: 5.5,
                panicLow: 0.05,
                panicHigh: 20.0,
              },
              sortOrder: 3,
            },
          ],
        },
      ],
    },
  },

  {
    name: '25-OH Vitamin D Total',
    category: 'Endocrinology',
    description: 'Serum 25-Hydroxycalciferol (D2+D3) bone mineral density and deficiency marker',
    defaultPrice: 1200.0,
    templateData: {
      sections: [
        {
          name: 'Vitamin D Status',
          sortOrder: 1,
          parameters: [
            {
              name: '25-Hydroxy Vitamin D (Total)',
              unit: 'ng/mL',
              inputType: 'NUMBER',
              method: 'Chemiluminescent Immunoassay (CLIA)',
              normalRange: {
                type: 'numeric',
                min: 30.0,
                max: 100.0,
                panicLow: 10.0,
              },
              sortOrder: 1,
            },
          ],
        },
      ],
    },
  },

  {
    name: 'Vitamin B12 (Cyanocobalamin)',
    category: 'Endocrinology',
    description: 'Neurological and megaloblastic anemia cofactor immunoassay',
    defaultPrice: 900.0,
    templateData: {
      sections: [
        {
          name: 'Vitamin B12 Assay',
          sortOrder: 1,
          parameters: [
            {
              name: 'Serum Vitamin B12',
              unit: 'pg/mL',
              inputType: 'NUMBER',
              method: 'Chemiluminescent Immunoassay (CLIA)',
              normalRange: { type: 'numeric', min: 211, max: 911 },
              sortOrder: 1,
            },
          ],
        },
      ],
    },
  },
];

export async function seedDefaultPanelTemplates(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(PanelTemplate);

  for (const tpl of defaultTemplates) {
    const existing = await repo.findOne({ where: { name: tpl.name } });
    if (!existing) {
      const template = repo.create({
        name: tpl.name,
        category: tpl.category,
        description: tpl.description,
        defaultPrice: tpl.defaultPrice,
        templateData: tpl.templateData,
      });
      await repo.save(template);
    } else {
      // Update template data and price if already exists
      existing.category = tpl.category;
      existing.description = tpl.description;
      existing.defaultPrice = tpl.defaultPrice;
      existing.templateData = tpl.templateData;
      await repo.save(existing);
    }
  }
}
