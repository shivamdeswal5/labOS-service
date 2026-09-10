export interface IReportFinalizedPayload {
  reportId: string;
  labId: string;
  patientId: string;
  patientName?: string;
  reportNumber: string;
  totalPrice: number;
  finalizedAt: string;
}

export interface ICriticalAlertPayload {
  reportId: string;
  labId: string;
  patientName: string;
  parameterName: string;
  value: string;
  criticalLow?: number;
  criticalHigh?: number;
}
