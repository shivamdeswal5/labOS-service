import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { Lab } from 'src/modules/labs/domain/lab/lab.entity';
import { Profile } from 'src/modules/labs/domain/profile/profile.entity';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import { StructuredNormalRange } from 'src/modules/panels/domain/panel/value-objects/normal-range.value-object';
import { NormalRangeTypeEnum } from 'src/modules/panels/domain/panel/enums/normal-range-type.enum';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';

export interface GenerateReportPdfOptions {
  report: Report;
  lab: Lab;
  pathologist?: Profile | null;
  referringDoctor?: ReferringDoctor | null;
  publicAppUrl?: string;
}

@Injectable()
export class ReportPdfGeneratorService {
  private readonly logger = new Logger(ReportPdfGeneratorService.name);

  async generatePdf(options: GenerateReportPdfOptions): Promise<Buffer> {
    const { report, lab, pathologist, referringDoctor, publicAppUrl } = options;

    const baseUrl = publicAppUrl || 'https://labos.app';
    const verifyUrl = `${baseUrl}/api/v1/public/reports/${report.shareToken}`;

    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      width: 55,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          bufferPages: true,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        const accentColor = lab.accentColor || '#1e3a8a';
        const primaryDark = '#0f172a';
        const textMuted = '#64748b';
        const borderColor = '#cbd5e1';

        // 1. Top Decorative Header Bar
        doc.rect(40, 40, 515, 4).fill(accentColor);

        // 2. Lab Header Details
        let cursorY = 52;
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .fillColor(accentColor)
          .text(lab.name || 'DIAGNOSTIC PATHOLOGY LABORATORY', 40, cursorY);

        cursorY = doc.y + 2;

        if (lab.tagline) {
          doc
            .font('Helvetica-Oblique')
            .fontSize(9)
            .fillColor(textMuted)
            .text(lab.tagline, 40, cursorY);
          cursorY = doc.y + 2;
        }

        const addressText = lab.address || 'Standard Laboratory Address, India';
        const contactText =
          lab.phoneNumbers && lab.phoneNumbers.length > 0
            ? `Phone: ${lab.phoneNumbers.join(', ')}`
            : 'Phone: Contact Laboratory Helpdesk';

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(primaryDark)
          .text(`${addressText} | ${contactText}`, 40, cursorY);

        cursorY = doc.y + 3;

        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#047857')
          .text('NABL / ISO 15189 COMPLIANT CLINICAL REPORTING', 40, cursorY);

        cursorY = doc.y + 6;

        // Divider Line
        doc
          .strokeColor(borderColor)
          .lineWidth(0.75)
          .moveTo(40, cursorY)
          .lineTo(555, cursorY)
          .stroke();

        cursorY += 8;

        // 3. Patient Demographic & Clinical Order Box
        const patientBoxY = cursorY;
        const patientBoxHeight = 68;

        doc
          .roundedRect(40, patientBoxY, 515, patientBoxHeight, 3)
          .fillAndStroke('#f8fafc', borderColor);

        const col1X = 50;
        const col2X = 310;
        let pRowY = patientBoxY + 7;

        // Patient Details (Left Column)
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(primaryDark);
        doc.text('Patient Name: ', col1X, pRowY, { continued: true });
        doc.font('Helvetica').text(report.patient?.name || 'N/A');

        pRowY += 14;
        doc.font('Helvetica-Bold').text('Age / Gender: ', col1X, pRowY, { continued: true });
        const sexText =
          report.patient?.sex === SexEnum.MALE
            ? 'Male'
            : report.patient?.sex === SexEnum.FEMALE
              ? 'Female'
              : 'Other';
        doc.font('Helvetica').text(`${report.patient?.age || 'N/A'} / ${sexText}`);

        pRowY += 14;
        doc.font('Helvetica-Bold').text('Patient ID / UHID: ', col1X, pRowY, { continued: true });
        doc.font('Helvetica').text(report.patient?.patientNumber || report.patientId.slice(0, 8));

        pRowY += 14;
        doc.font('Helvetica-Bold').text('Ref By Doctor: ', col1X, pRowY, { continued: true });
        doc
          .font('Helvetica')
          .text(referringDoctor?.name || 'Self / Direct Walk-in');

        // Accession Details (Right Column)
        pRowY = patientBoxY + 7;
        doc.font('Helvetica-Bold').text('Report Accession No: ', col2X, pRowY, { continued: true });
        doc.font('Helvetica').text(report.reportNumber);

        pRowY += 14;
        doc.font('Helvetica-Bold').text('Sample Collected: ', col2X, pRowY, { continued: true });
        const collectedDateStr = report.sampleCollectedAt
          ? new Date(report.sampleCollectedAt).toLocaleString('en-IN')
          : 'Standard Timing';
        doc.font('Helvetica').text(collectedDateStr);

        pRowY += 14;
        doc.font('Helvetica-Bold').text('Report Finalized: ', col2X, pRowY, { continued: true });
        const finalizedDateStr = report.finalizedAt
          ? new Date(report.finalizedAt).toLocaleString('en-IN')
          : new Date().toLocaleString('en-IN');
        doc.font('Helvetica').text(finalizedDateStr);

        pRowY += 14;
        doc.font('Helvetica-Bold').text('Contact: ', col2X, pRowY, { continued: true });
        doc.font('Helvetica').text(report.patient?.phone || 'N/A');

        cursorY = patientBoxY + patientBoxHeight + 12;

        // 4. Test Results Table Header
        const tableHeaderY = cursorY;
        const colWidths = {
          param: 180,
          value: 75,
          flag: 50,
          unit: 60,
          range: 150,
        };

        doc.rect(40, tableHeaderY, 515, 18).fill('#1e293b');

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff');
        let hX = 48;
        doc.text('TEST / PARAMETER', hX, tableHeaderY + 5);
        hX += colWidths.param;
        doc.text('VALUE', hX, tableHeaderY + 5, { width: colWidths.value, align: 'center' });
        hX += colWidths.value;
        doc.text('FLAG', hX, tableHeaderY + 5, { width: colWidths.flag, align: 'center' });
        hX += colWidths.flag;
        doc.text('UNITS', hX, tableHeaderY + 5, { width: colWidths.unit, align: 'center' });
        hX += colWidths.unit;
        doc.text('REFERENCE INTERVAL', hX, tableHeaderY + 5);

        cursorY = tableHeaderY + 22;

        // 5. Render Test Panels and Parameter Rows
        const panels = report.reportPanels?.map((rp) => rp.panel) || [];
        const values = report.values || [];

        // If report has panels, iterate by panel
        if (panels.length > 0) {
          for (const panel of panels) {
            // Panel Header Banner
            doc.rect(40, cursorY, 515, 14).fill('#e2e8f0');
            doc
              .font('Helvetica-Bold')
              .fontSize(8)
              .fillColor('#0f172a')
              .text(
                `${panel.category?.toUpperCase() || 'DIAGNOSTIC'} - ${panel.name.toUpperCase()}`,
                48,
                cursorY + 3,
              );

            cursorY += 18;

            // Match values belonging to this panel's parameters
            const panelParamIds = new Set(
              panel.sections?.flatMap((s) => s.parameters?.map((p) => p.id) || []) || [],
            );

            const panelValues = values.filter((v) => panelParamIds.has(v.parameterId));
            const valuesToRender = panelValues.length > 0 ? panelValues : values;

            for (const val of valuesToRender) {
              const param = val.parameter;
              const isAbnormal = val.isOutOfRange;
              const rowHeight = 16;

              // Row background zebra or plain
              doc
                .strokeColor('#f1f5f9')
                .lineWidth(0.5)
                .moveTo(40, cursorY + rowHeight)
                .lineTo(555, cursorY + rowHeight)
                .stroke();

              let rX = 48;

              // Parameter Name
              doc
                .font(isAbnormal ? 'Helvetica-Bold' : 'Helvetica')
                .fontSize(8)
                .fillColor(isAbnormal ? '#b91c1c' : primaryDark)
                .text(param?.name || 'Parameter', rX, cursorY + 3, {
                  width: colWidths.param - 10,
                });

              rX += colWidths.param;

              // Observed Value
              doc
                .font(isAbnormal ? 'Helvetica-Bold' : 'Helvetica')
                .fontSize(8.5)
                .fillColor(isAbnormal ? '#dc2626' : primaryDark)
                .text(val.value || 'N/A', rX, cursorY + 3, {
                  width: colWidths.value,
                  align: 'center',
                });

              rX += colWidths.value;

              // Status Flag
              if (isAbnormal) {
                doc
                  .font('Helvetica-Bold')
                  .fontSize(7.5)
                  .fillColor('#dc2626')
                  .text('ABNORMAL', rX, cursorY + 3, {
                    width: colWidths.flag,
                    align: 'center',
                  });
              } else {
                doc
                  .font('Helvetica')
                  .fontSize(7.5)
                  .fillColor(textMuted)
                  .text('Normal', rX, cursorY + 3, {
                    width: colWidths.flag,
                    align: 'center',
                  });
              }

              rX += colWidths.flag;

              // Units
              doc
                .font('Helvetica')
                .fontSize(7.5)
                .fillColor(textMuted)
                .text(param?.unit || '-', rX, cursorY + 3, {
                  width: colWidths.unit,
                  align: 'center',
                });

              rX += colWidths.unit;

              // Reference Range
              const rangeText = this.formatReferenceRange(
                param?.normalRange,
                report.patient?.sex,
              );
              doc
                .font('Helvetica')
                .fontSize(7.5)
                .fillColor(textMuted)
                .text(rangeText, rX, cursorY + 3, { width: colWidths.range });

              cursorY += rowHeight;

              // Check if near bottom of page
              if (cursorY > 700) {
                doc.addPage();
                cursorY = 40;
              }
            }

            cursorY += 6;
          }
        } else {
          // Fallback if no panels joined
          for (const val of values) {
            const param = val.parameter;
            const isAbnormal = val.isOutOfRange;
            const rowHeight = 16;

            let rX = 48;
            doc
              .font(isAbnormal ? 'Helvetica-Bold' : 'Helvetica')
              .fontSize(8)
              .fillColor(isAbnormal ? '#b91c1c' : primaryDark)
              .text(param?.name || 'Parameter', rX, cursorY + 3, { width: colWidths.param });

            rX += colWidths.param;
            doc
              .font(isAbnormal ? 'Helvetica-Bold' : 'Helvetica')
              .fontSize(8.5)
              .fillColor(isAbnormal ? '#dc2626' : primaryDark)
              .text(val.value || 'N/A', rX, cursorY + 3, {
                width: colWidths.value,
                align: 'center',
              });

            rX += colWidths.value;
            doc
              .font('Helvetica')
              .fontSize(7.5)
              .fillColor(textMuted)
              .text(isAbnormal ? 'ABNORMAL' : 'Normal', rX, cursorY + 3, {
                width: colWidths.flag,
                align: 'center',
              });

            rX += colWidths.flag;
            doc
              .font('Helvetica')
              .fontSize(7.5)
              .fillColor(textMuted)
              .text(param?.unit || '-', rX, cursorY + 3, {
                width: colWidths.unit,
                align: 'center',
              });

            rX += colWidths.unit;
            const rangeText = this.formatReferenceRange(
              param?.normalRange,
              report.patient?.sex,
            );
            doc
              .font('Helvetica')
              .fontSize(7.5)
              .fillColor(textMuted)
              .text(rangeText, rX, cursorY + 3);

            cursorY += rowHeight;
          }
        }

        // 6. Clinical Remarks Box (if any)
        if (report.remarks) {
          cursorY += 6;
          doc
            .roundedRect(40, cursorY, 515, 34, 3)
            .fillAndStroke('#fffbeb', '#fde68a');

          doc
            .font('Helvetica-Bold')
            .fontSize(7.5)
            .fillColor('#92400e')
            .text('PATHOLOGIST CLINICAL REMARKS / IMPRESSION:', 48, cursorY + 5);

          doc
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor('#78350f')
            .text(report.remarks, 48, cursorY + 16, { width: 500 });

          cursorY += 42;
        }

        // 7. Footer & Verification Section (At bottom of page)
        const footerY = 720;

        // Horizontal Footer Rule
        doc
          .strokeColor(borderColor)
          .lineWidth(0.75)
          .moveTo(40, footerY)
          .lineTo(555, footerY)
          .stroke();

        // Render Pre-generated QR Code for online verification
        doc.image(qrBuffer, 45, footerY + 8, { width: 52, height: 52 });

        doc
          .font('Helvetica-Bold')
          .fontSize(6.5)
          .fillColor(primaryDark)
          .text('AUTHENTICITY QR CODE', 105, footerY + 12);

        doc
          .font('Helvetica')
          .fontSize(6)
          .fillColor(textMuted)
          .text('Scan with smartphone to verify original signed report online.', 105, footerY + 22, {
            width: 170,
          });

        doc
          .font('Helvetica-Oblique')
          .fontSize(5.5)
          .fillColor(textMuted)
          .text(`Token: ${report.shareToken.slice(0, 16)}...`, 105, footerY + 42);

        // Pathologist Sign-off (Right-aligned)
        const signX = 360;
        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(primaryDark)
          .text(pathologist?.fullName || 'Dr. Consultant Pathologist', signX, footerY + 14, {
            width: 190,
            align: 'right',
          });

        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor(textMuted)
          .text(
            pathologist?.qualification || 'M.D. (Pathology), DCP',
            signX,
            footerY + 26,
            { width: 190, align: 'right' },
          );

        doc
          .font('Helvetica-Oblique')
          .fontSize(6.5)
          .fillColor('#047857')
          .text('Digitally Verified & Authorized', signX, footerY + 37, {
            width: 190,
            align: 'right',
          });

        // Bottom Disclaimer Bar
        doc
          .font('Helvetica')
          .fontSize(5.5)
          .fillColor(textMuted)
          .text(
            lab.footerNote ||
              'Medical diagnostic report for clinical correlation. Not valid for medico-legal purposes.',
            40,
            800,
            { width: 515, align: 'center' },
          );

        doc.end();
      } catch (error) {
        this.logger.error('Failed to generate diagnostic report PDF', error);
        reject(error);
      }
    });
  }

  private formatReferenceRange(
    normalRange: StructuredNormalRange | null | undefined,
    sex?: SexEnum,
  ): string {
    if (!normalRange) return '-';

    if (normalRange.type === NormalRangeTypeEnum.NUMERIC) {
      if (normalRange.min !== undefined && normalRange.max !== undefined) {
        return `${normalRange.min} - ${normalRange.max}`;
      }
      if (normalRange.min !== undefined) return `>= ${normalRange.min}`;
      if (normalRange.max !== undefined) return `<= ${normalRange.max}`;
      return '-';
    }

    if (normalRange.type === NormalRangeTypeEnum.GENDER_SPECIFIC) {
      if (sex === SexEnum.FEMALE && normalRange.female) {
        return `Female: ${normalRange.female.min} - ${normalRange.female.max}`;
      }
      if (sex === SexEnum.MALE && normalRange.male) {
        return `Male: ${normalRange.male.min} - ${normalRange.male.max}`;
      }
      const parts: string[] = [];
      if (normalRange.male) parts.push(`M: ${normalRange.male.min}-${normalRange.male.max}`);
      if (normalRange.female) parts.push(`F: ${normalRange.female.min}-${normalRange.female.max}`);
      return parts.join(', ') || '-';
    }

    if (normalRange.type === NormalRangeTypeEnum.TEXT) {
      return normalRange.text || '-';
    }

    return '-';
  }
}
