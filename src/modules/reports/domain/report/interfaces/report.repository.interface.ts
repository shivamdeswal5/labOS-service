import { Report } from '../report.entity';
import { ReportStatusEnum } from '../enums/report-status.enum';

export const REPORT_REPOSITORY_TOKEN = Symbol('IReportRepository');

export interface DashboardStats {
  todayPatientsCount: number;
  todayReportsCount: number;
  pendingResultsCount: number;
  readyForReviewCount: number;
  finalizedTodayCount: number;
  overdueCount: number;
  todayRevenue: number;
  pendingCollectionsCount: number;
}

export interface IReportRepository {
  findById(id: string, labId: string): Promise<Report | null>;
  findByShareToken(token: string): Promise<Report | null>;
  findByLabId(labId: string, status?: ReportStatusEnum): Promise<Report[]>;
  findByPatientId(labId: string, patientId: string): Promise<Report[]>;
  getDashboardStats(labId: string): Promise<DashboardStats>;
  save(report: Report): Promise<Report>;
  create(data: Partial<Report>): Promise<Report>;
  softDelete(id: string, labId: string): Promise<boolean>;
}
