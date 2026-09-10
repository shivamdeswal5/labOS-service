import { describe, it, expect } from 'vitest';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationTypeEnum } from '../notification/enums/notification-type.enum';

describe('NotificationTemplateService', () => {
  const service = new NotificationTemplateService();

  it('renders report ready notification with patient name and report URL', () => {
    const result = service.render(NotificationTypeEnum.REPORT_READY, {
      patientName: 'Ramesh Patel',
      labName: 'Apex Diagnostics',
      reportUrl: 'https://labos.app/api/v1/public/reports/token123',
    });

    expect(result).toContain('Ramesh Patel');
    expect(result).toContain('Apex Diagnostics');
    expect(result).toContain('https://labos.app/api/v1/public/reports/token123');
  });

  it('renders critical alert notification with critical parameters', () => {
    const result = service.render(NotificationTypeEnum.CRITICAL_ALERT, {
      patientName: 'Sunita Sharma',
      labName: 'City Lab',
      reportUrl: 'https://labos.app/api/v1/public/reports/urgent456',
      criticalParameters: ['Serum Potassium', 'Blood Glucose Fasting'],
    });

    expect(result).toContain('URGENT MEDICAL ALERT');
    expect(result).toContain('Serum Potassium, Blood Glucose Fasting');
    expect(result).toContain('Sunita Sharma');
  });

  it('renders payment receipt notification with amount and invoice number', () => {
    const result = service.render(NotificationTypeEnum.PAYMENT_RECEIPT, {
      patientName: 'Amit Verma',
      labName: 'Metro Path Labs',
      amount: 1250,
      invoiceNumber: 'INV-2026-0042',
    });

    expect(result).toContain('INR 1250');
    expect(result).toContain('INV-2026-0042');
  });
});
