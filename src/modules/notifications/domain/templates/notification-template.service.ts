import { Injectable } from '@nestjs/common';
import { NotificationTypeEnum } from '../notification/enums/notification-type.enum';

export interface TemplateData {
  patientName?: string;
  doctorName?: string;
  labName?: string;
  reportUrl?: string;
  invoiceNumber?: string;
  amount?: number;
  criticalParameters?: string[];
  customMessage?: string;
}

@Injectable()
export class NotificationTemplateService {
  render(type: NotificationTypeEnum, data: TemplateData): string {
    const labName = data.labName || 'Our Diagnostic Lab';

    switch (type) {
      case NotificationTypeEnum.REPORT_READY:
        return (
          `Hello ${data.patientName || 'Valued Patient'},\n\n` +
          `Your diagnostic test report from ${labName} is now ready.\n\n` +
          `You can view and download your verified report securely here:\n` +
          `${data.reportUrl || ''}\n\n` +
          `Thank you for choosing ${labName}. Wish you good health!`
        );

      case NotificationTypeEnum.CRITICAL_ALERT:
        return (
          `URGENT MEDICAL ALERT - ${labName}\n\n` +
          `Patient: ${data.patientName || 'Unknown'}\n` +
          `Critical values detected for: ${data.criticalParameters?.join(', ') || 'Diagnostic Panel'}.\n\n` +
          `Please access the report immediately: ${data.reportUrl || ''}\n\n` +
          `Immediate clinical correlation recommended.`
        );

      case NotificationTypeEnum.PAYMENT_RECEIPT:
        return (
          `Hello ${data.patientName || 'Valued Patient'},\n\n` +
          `Thank you for your payment of INR ${data.amount || 0} to ${labName}.\n` +
          `Invoice Number: ${data.invoiceNumber || 'N/A'}.\n\n` +
          `Thank you for your trust in our services.`
        );

      case NotificationTypeEnum.CUSTOM:
      default:
        return data.customMessage || `Notification from ${labName}.`;
    }
  }
}
