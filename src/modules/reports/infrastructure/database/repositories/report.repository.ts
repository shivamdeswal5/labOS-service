import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import {
  IReportRepository,
  DashboardStats,
} from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import { ReportStatusEnum } from 'src/modules/reports/domain/report/enums/report-status.enum';

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

  async findById(id: string, labId: string): Promise<Report | null> {
    return this.reportRepo.findOne({
      where: { id, labId },
      relations: {
        patient: true,
        reportPanels: { panel: { sections: { parameters: true } } },
        values: { parameter: true },
        amendments: true,
      },
    });
  }

  async findByShareToken(token: string): Promise<Report | null> {
    return this.reportRepo.findOne({
      where: { shareToken: token },
      relations: {
        patient: true,
        reportPanels: { panel: { sections: { parameters: true } } },
        values: { parameter: true },
      },
    });
  }

  async findByLabId(labId: string, status?: ReportStatusEnum): Promise<Report[]> {
    const query = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.patient', 'patient')
      .where('report.lab_id = :labId', { labId })
      .andWhere('report.deleted_at IS NULL');

    if (status !== undefined) {
      query.andWhere('report.status = :status', { status });
    }

    return query
      .orderBy('report.created_at', 'DESC')
      .getMany();
  }

  async findByPatientId(labId: string, patientId: string): Promise<Report[]> {
    return this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.patient', 'patient')
      .where('report.lab_id = :labId', { labId })
      .andWhere('report.patient_id = :patientId', { patientId })
      .andWhere('report.deleted_at IS NULL')
      .orderBy('report.created_at', 'DESC')
      .getMany();
  }

  async getDashboardStats(labId: string): Promise<DashboardStats> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const reportStats = await this.reportRepo
      .createQueryBuilder('report')
      .select([
        'COUNT(CASE WHEN report.created_at >= :startOfDay THEN 1 END) AS "todayReportsCount"',
        'COUNT(DISTINCT CASE WHEN report.created_at >= :startOfDay THEN report.patient_id END) AS "todayPatientsCount"',
        'COUNT(CASE WHEN report.status = 0 AND report.results_entered_at IS NULL THEN 1 END) AS "pendingResultsCount"',
        'COUNT(CASE WHEN report.status = 0 AND report.results_entered_at IS NOT NULL THEN 1 END) AS "readyForReviewCount"',
        'COUNT(CASE WHEN report.status = 1 AND report.finalized_at >= :startOfDay THEN 1 END) AS "finalizedTodayCount"',
        'COUNT(CASE WHEN report.status = 0 AND report.created_at < :twentyFourHoursAgo THEN 1 END) AS "overdueCount"',
      ])
      .where('report.lab_id = :labId', { labId })
      .andWhere('report.deleted_at IS NULL')
      .setParameters({ startOfDay, twentyFourHoursAgo })
      .getRawOne();

    let todayRevenue = 0;
    try {
      const revenueResult = await this.reportRepo.manager
        .createQueryBuilder()
        .select('COALESCE(SUM(invoice.paid_amount), 0)', 'totalRevenue')
        .from('invoices', 'invoice')
        .where('invoice.lab_id = :labId', { labId })
        .andWhere('invoice.paid_at >= :startOfDay', { startOfDay })
        .getRawOne();
      todayRevenue = Number(revenueResult?.totalRevenue || 0);
    } catch {
      todayRevenue = 0;
    }

    let pendingCollectionsCount = 0;
    try {
      const collectionsResult = await this.reportRepo.manager
        .createQueryBuilder()
        .select('COUNT(1)', 'count')
        .from('collection_requests', 'col')
        .where('col.lab_id = :labId', { labId })
        .andWhere('col.status IN (0, 1, 2)')
        .andWhere('col.scheduled_date >= :startOfDay', { startOfDay })
        .getRawOne();
      pendingCollectionsCount = Number(collectionsResult?.count || 0);
    } catch {
      pendingCollectionsCount = 0;
    }

    return {
      todayPatientsCount: Number(reportStats?.todayPatientsCount || 0),
      todayReportsCount: Number(reportStats?.todayReportsCount || 0),
      pendingResultsCount: Number(reportStats?.pendingResultsCount || 0),
      readyForReviewCount: Number(reportStats?.readyForReviewCount || 0),
      finalizedTodayCount: Number(reportStats?.finalizedTodayCount || 0),
      overdueCount: Number(reportStats?.overdueCount || 0),
      todayRevenue,
      pendingCollectionsCount,
    };
  }

  async save(report: Report): Promise<Report> {
    return this.reportRepo.save(report);
  }

  async create(data: Partial<Report>): Promise<Report> {
    const report = this.reportRepo.create(data);
    return this.reportRepo.save(report);
  }

  async softDelete(id: string, labId: string): Promise<boolean> {
    const result = await this.reportRepo.softDelete({ id, labId });
    return (result.affected ?? 0) > 0;
  }
}
