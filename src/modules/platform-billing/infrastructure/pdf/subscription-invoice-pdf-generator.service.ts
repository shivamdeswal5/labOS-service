import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { SubscriptionInvoice } from '../../domain/entities/subscription-invoice.entity';

export interface InvoicePdfOptions {
  invoice: SubscriptionInvoice;
  labName?: string;
  labAddress?: string;
  planName?: string;
  billingCycle?: string;
}

@Injectable()
export class SubscriptionInvoicePdfGeneratorService {
  private readonly logger = new Logger(SubscriptionInvoicePdfGeneratorService.name);

  async generatePdf(options: InvoicePdfOptions): Promise<Buffer> {
    const { invoice, labName = 'Diagnostic Laboratory', labAddress = 'India', planName = 'Growth Tier', billingCycle = 'MONTHLY' } = options;

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

        const primaryDark = '#0f172a';
        const brandEmerald = '#059669';
        const textMuted = '#475569';
        const borderColor = '#e2e8f0';

        // 1. Top Decorative Brand Bar
        doc.rect(40, 40, 515, 5).fill(brandEmerald);

        // 2. Header: Pathiq Corporate Identity (Supplier)
        doc.font('Helvetica-Bold').fontSize(20).fillColor(brandEmerald).text('PATHIQ', 40, 55);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark).text('LABORATORY OPERATING SYSTEM', 40, 78);
        doc.font('Helvetica').fontSize(8).fillColor(textMuted)
          .text('Pathiq Healthtech Private Limited', 40, 92)
          .text('DLF CyberCity, Phase III, Gurugram, Haryana - 122002', 40, 104)
          .text('GSTIN: 06AAECP1234F1Z8 | State Code: 06 (Haryana)', 40, 116)
          .text('Corporate PAN: AAECP1234F | support@pathiq.in', 40, 128);

        // 3. Invoice Badge & Metadata (Right Aligned)
        doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryDark).text('TAX INVOICE', 360, 55, { align: 'right', width: 195 });
        doc.font('Helvetica-Bold').fontSize(8).fillColor(textMuted).text('(Original for Recipient — Rule 46 GST)', 360, 72, { align: 'right', width: 195 });

        doc.rect(360, 88, 195, 50).fillAndStroke('#f8fafc', borderColor);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(textMuted).text('INVOICE NO:', 370, 95);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark).text(invoice.invoiceNumber, 440, 95, { align: 'right', width: 105 });

        const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
        doc.font('Helvetica-Bold').fontSize(8).fillColor(textMuted).text('DATE:', 370, 110);
        doc.font('Helvetica').fontSize(8).fillColor(primaryDark).text(invoiceDate, 440, 110, { align: 'right', width: 105 });

        doc.font('Helvetica-Bold').fontSize(8).fillColor(textMuted).text('STATUS:', 370, 124);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(brandEmerald).text('PAID (INR)', 440, 124, { align: 'right', width: 105 });

        // 4. B2B Recipient Details Box (Bill To)
        const recipientBoxY = 150;
        doc.rect(40, recipientBoxY, 515, 60).fillAndStroke('#f1f5f9', borderColor);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark).text('BILLED TO (RECIPIENT):', 50, recipientBoxY + 10);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark).text(labName, 50, recipientBoxY + 24);
        doc.font('Helvetica').fontSize(8).fillColor(textMuted).text(labAddress, 50, recipientBoxY + 37);

        doc.font('Helvetica-Bold').fontSize(8).fillColor(textMuted).text('RECIPIENT GSTIN:', 320, recipientBoxY + 10);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark).text(invoice.customerGstin || 'Unregistered / Consumer', 320, recipientBoxY + 24);
        doc.font('Helvetica').fontSize(8).fillColor(textMuted).text(`Lab ID: ${invoice.labId.slice(0, 18)}...`, 320, recipientBoxY + 37);

        // 5. Line Items Table Header
        const tableHeaderY = 225;
        doc.rect(40, tableHeaderY, 515, 22).fill(primaryDark);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff')
          .text('DESCRIPTION OF SERVICE', 50, tableHeaderY + 6, { width: 220 })
          .text('SAC CODE', 270, tableHeaderY + 6, { width: 60, align: 'center' })
          .text('TAXABLE VAL', 340, tableHeaderY + 6, { width: 80, align: 'right' })
          .text('GST (18%)', 430, tableHeaderY + 6, { width: 55, align: 'right' })
          .text('TOTAL (INR)', 495, tableHeaderY + 6, { width: 50, align: 'right' });

        // 6. Line Item Row
        const rowY = tableHeaderY + 22;
        doc.rect(40, rowY, 515, 45).fillAndStroke('#ffffff', borderColor);

        const periodStartStr = invoice.billingPeriodStart ? new Date(invoice.billingPeriodStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const periodEndStr = invoice.billingPeriodEnd ? new Date(invoice.billingPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark)
          .text(`Pathiq LabOS Platform — ${planName}`, 50, rowY + 10);
        doc.font('Helvetica').fontSize(8).fillColor(textMuted)
          .text(`Subscription Cycle: ${billingCycle} (${periodStartStr} to ${periodEndStr})`, 50, rowY + 24);

        doc.font('Helvetica').fontSize(8).fillColor(primaryDark).text('998313', 270, rowY + 16, { width: 60, align: 'center' });
        doc.font('Helvetica').fontSize(8).fillColor(primaryDark).text(`Rs. ${Number(invoice.subtotalInr).toFixed(2)}`, 340, rowY + 16, { width: 80, align: 'right' });
        doc.font('Helvetica').fontSize(8).fillColor(primaryDark).text(`Rs. ${Number(invoice.taxAmountInr).toFixed(2)}`, 430, rowY + 16, { width: 55, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark).text(`Rs. ${Number(invoice.amountInr).toFixed(2)}`, 495, rowY + 16, { width: 50, align: 'right' });

        // 7. Tax Summary & Totals Box
        const summaryY = rowY + 55;
        doc.rect(340, summaryY, 215, 95).fillAndStroke('#f8fafc', borderColor);

        const cgstAmount = (Number(invoice.taxAmountInr) / 2).toFixed(2);
        const sgstAmount = (Number(invoice.taxAmountInr) / 2).toFixed(2);

        doc.font('Helvetica').fontSize(8).fillColor(textMuted).text('Taxable Subtotal:', 350, summaryY + 10);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(primaryDark).text(`Rs. ${Number(invoice.subtotalInr).toFixed(2)}`, 440, summaryY + 10, { width: 105, align: 'right' });

        doc.font('Helvetica').fontSize(8).fillColor(textMuted).text('Central GST (CGST @ 9%):', 350, summaryY + 25);
        doc.font('Helvetica').fontSize(8).fillColor(primaryDark).text(`Rs. ${cgstAmount}`, 440, summaryY + 25, { width: 105, align: 'right' });

        doc.font('Helvetica').fontSize(8).fillColor(textMuted).text('State GST (SGST @ 9%):', 350, summaryY + 40);
        doc.font('Helvetica').fontSize(8).fillColor(primaryDark).text(`Rs. ${sgstAmount}`, 440, summaryY + 40, { width: 105, align: 'right' });

        doc.rect(340, summaryY + 58, 215, 1).fill(borderColor);

        doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryDark).text('TOTAL INVOICE VALUE:', 350, summaryY + 68);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(brandEmerald).text(`Rs. ${Number(invoice.amountInr).toFixed(2)}`, 440, summaryY + 68, { width: 105, align: 'right' });

        // 8. Payment Settlement Reference
        const paymentDetailsY = summaryY;
        doc.rect(40, paymentDetailsY, 280, 95).fillAndStroke('#ffffff', borderColor);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(primaryDark).text('PAYMENT SETTLEMENT REFERENCE', 50, paymentDetailsY + 10);

        const paymentProvider = invoice.payment?.provider || 'RAZORPAY';
        const paymentRef = invoice.payment?.providerPaymentId || invoice.payment?.providerOrderId || 'OFFLINE_UTR';
        const method = invoice.payment?.paymentMethod || 'DOMESTIC_UPI';

        doc.font('Helvetica').fontSize(8).fillColor(textMuted)
          .text(`Gateway Provider: ${paymentProvider}`, 50, paymentDetailsY + 28)
          .text(`Method / Channel: ${method}`, 50, paymentDetailsY + 42)
          .text(`Transaction Reference: ${paymentRef}`, 50, paymentDetailsY + 56)
          .text(`Settlement Status: Authorized & Settled`, 50, paymentDetailsY + 70);

        // 9. Statutory GST Declaration & Footer
        const footerY = 560;
        doc.rect(40, footerY, 515, 60).fillAndStroke('#f8fafc', borderColor);
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(primaryDark).text('STATUTORY DECLARATION UNDER GST RULE 46:', 50, footerY + 8);
        doc.font('Helvetica').fontSize(7).fillColor(textMuted)
          .text('1. All diagnostic software and IT services provided under SAC Code 998313 are subject to 18% Goods and Services Tax.', 50, footerY + 20)
          .text('2. Recipient labs registered under GST can claim 100% Input Tax Credit (ITC) on GSTR-3B filings against this invoice.', 50, footerY + 30)
          .text('3. This is a computer-generated tax invoice verified under Pathiq digital cryptographic infrastructure. No physical signature required.', 50, footerY + 40);

        // Bottom Brand Seal
        doc.font('Helvetica-Bold').fontSize(8).fillColor(brandEmerald).text('PATHIQ AUTOPAY VERIFIED — 100% SECURE HEALTHCARE INFRASTRUCTURE', 40, 640, { align: 'center', width: 515 });

        doc.end();
      } catch (err: any) {
        this.logger.error(`Error generating invoice PDF: ${err.message}`, err.stack);
        reject(err);
      }
    });
  }
}
