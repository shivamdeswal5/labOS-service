import { DataSource } from 'typeorm';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';

export const defaultTemplates = [
  {
    name: 'Complete Blood Count (CBC)',
    category: 'Haematology',
    description: 'Complete hemogram with automated 5-part differential',
    defaultPrice: 350.0,
    templateData: {
      sections: [
        {
          name: 'Haemogram',
          sortOrder: 1,
          parameters: [
            {
              name: 'Hemoglobin',
              nameLocal: 'हीमोग्लोबिन',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'Cyanmethemoglobin',
              normalRange: {
                type: 'gender_specific',
                male: { min: 13.0, max: 17.0 },
                female: { min: 12.0, max: 15.5 },
              },
              sortOrder: 1,
            },
            {
              name: 'Total Leukocyte Count (TLC)',
              nameLocal: 'सफेद रक्त कोशिकाएं',
              unit: '/cumm',
              inputType: 'NUMBER',
              method: 'Flow Cytometry',
              normalRange: {
                type: 'numeric',
                min: 4000,
                max: 11000,
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
                male: { min: 4.5, max: 5.9 },
                female: { min: 4.0, max: 5.2 },
              },
              sortOrder: 4,
            },
            {
              name: 'Packed Cell Volume (PCV)',
              unit: '%',
              inputType: 'NUMBER',
              normalRange: {
                type: 'gender_specific',
                male: { min: 40, max: 50 },
                female: { min: 36, max: 46 },
              },
              sortOrder: 5,
            },
          ],
        },
        {
          name: 'Differential Leukocyte Count (DLC)',
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
              normalRange: { type: 'numeric', min: 20, max: 40 },
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
              normalRange: { type: 'numeric', min: 2, max: 8 },
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
      ],
    },
  },
  {
    name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    description: 'Comprehensive liver enzyme and bilirubin profile',
    defaultPrice: 650.0,
    templateData: {
      sections: [
        {
          name: 'Liver Enzymes & Bilirubin',
          sortOrder: 1,
          parameters: [
            {
              name: 'Bilirubin Total',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Diazo Method',
              normalRange: { type: 'numeric', min: 0.2, max: 1.2 },
              sortOrder: 1,
            },
            {
              name: 'Bilirubin Direct',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Diazo Method',
              normalRange: { type: 'numeric', min: 0.0, max: 0.3 },
              sortOrder: 2,
            },
            {
              name: 'SGOT / AST',
              unit: 'U/L',
              inputType: 'NUMBER',
              method: 'UV Kinetic',
              normalRange: { type: 'numeric', min: 5, max: 40 },
              sortOrder: 3,
            },
            {
              name: 'SGPT / ALT',
              unit: 'U/L',
              inputType: 'NUMBER',
              method: 'UV Kinetic',
              normalRange: { type: 'numeric', min: 5, max: 45 },
              sortOrder: 4,
            },
            {
              name: 'Alkaline Phosphatase (ALP)',
              unit: 'U/L',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 30, max: 120 },
              sortOrder: 5,
            },
            {
              name: 'Total Protein',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'Biuret',
              normalRange: { type: 'numeric', min: 6.0, max: 8.3 },
              sortOrder: 6,
            },
            {
              name: 'Serum Albumin',
              unit: 'g/dL',
              inputType: 'NUMBER',
              method: 'BCG',
              normalRange: { type: 'numeric', min: 3.5, max: 5.0 },
              sortOrder: 7,
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Kidney Function Test (KFT / RFT)',
    category: 'Biochemistry',
    description: 'Renal panel including Urea, Creatinine, and Electrolytes',
    defaultPrice: 600.0,
    templateData: {
      sections: [
        {
          name: 'Renal Parameters',
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
              name: 'Serum Creatinine',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Modified Jaffe',
              normalRange: {
                type: 'gender_specific',
                male: { min: 0.7, max: 1.3 },
                female: { min: 0.6, max: 1.1 },
              },
              sortOrder: 2,
            },
            {
              name: 'Uric Acid',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              method: 'Uricase',
              normalRange: {
                type: 'gender_specific',
                male: { min: 3.4, max: 7.0 },
                female: { min: 2.4, max: 5.7 },
              },
              sortOrder: 3,
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Lipid Profile',
    category: 'Biochemistry',
    description: 'Cardiovascular lipid risk assessment',
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
              normalRange: { type: 'numeric', min: 125, max: 200 },
              sortOrder: 1,
            },
            {
              name: 'Triglycerides',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 50, max: 150 },
              sortOrder: 2,
            },
            {
              name: 'HDL Cholesterol (Good)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 40, max: 60 },
              sortOrder: 3,
            },
            {
              name: 'LDL Cholesterol (Bad)',
              unit: 'mg/dL',
              inputType: 'NUMBER',
              normalRange: { type: 'numeric', min: 50, max: 100 },
              sortOrder: 4,
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Urine Routine & Microscopic',
    category: 'Clinical Pathology',
    description: 'Complete physical, chemical and microscopic examination of urine',
    defaultPrice: 150.0,
    templateData: {
      sections: [
        {
          name: 'Physical Examination',
          sortOrder: 1,
          parameters: [
            {
              name: 'Colour',
              inputType: 'TEXT',
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
          name: 'Chemical Examination',
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
              options: ['Nil', 'Trace', '1+', '2+', '3+', '4+'],
              normalRange: { type: 'text', text: 'Nil' },
              sortOrder: 2,
            },
            {
              name: 'Urine Sugar / Glucose',
              inputType: 'DROPDOWN',
              options: ['Nil', 'Trace', '1+', '2+', '3+', '4+'],
              normalRange: { type: 'text', text: 'Nil' },
              sortOrder: 3,
            },
          ],
        },
        {
          name: 'Microscopic Examination',
          sortOrder: 3,
          parameters: [
            {
              name: 'Pus Cells (WBCs)',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: '0-5 /HPF' },
              sortOrder: 1,
            },
            {
              name: 'RBCs',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: 'Nil /HPF' },
              sortOrder: 2,
            },
            {
              name: 'Epithelial Cells',
              unit: '/HPF',
              inputType: 'TEXT',
              normalRange: { type: 'text', text: 'Occasional /HPF' },
              sortOrder: 3,
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
    }
  }
}
