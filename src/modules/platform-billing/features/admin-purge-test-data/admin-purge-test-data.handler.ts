import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminPurgeTestDataCommand } from './admin-purge-test-data.command';

export interface AdminPurgeTestDataResult {
  success: boolean;
  labId: string;
  deletedCounts: {
    reports: number;
    invoices: number;
    patients: number;
    collections: number;
  };
  purgedAt: string;
}

@Injectable()
export class AdminPurgeTestDataHandler {
  private readonly logger = new Logger(AdminPurgeTestDataHandler.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(command: AdminPurgeTestDataCommand): Promise<AdminPurgeTestDataResult> {
    const { labId, adminEmail } = command;

    return this.dataSource.transaction(async (manager) => {
      // 1. Verify lab exists
      const labExists = await manager.query(
        'SELECT id, name FROM labs WHERE id = $1',
        [labId],
      );
      if (!labExists || labExists.length === 0) {
        throw new NotFoundException(`Laboratory '${labId}' not found`);
      }
      const labName = labExists[0].name;

      // 2. Cascade delete clinical report entities
      await manager.query(
        'DELETE FROM report_values WHERE report_id IN (SELECT id FROM reports WHERE lab_id = $1)',
        [labId],
      );
      await manager.query(
        'DELETE FROM report_panels WHERE report_id IN (SELECT id FROM reports WHERE lab_id = $1)',
        [labId],
      );
      await manager.query(
        'DELETE FROM report_amendments WHERE report_id IN (SELECT id FROM reports WHERE lab_id = $1)',
        [labId],
      );
      const reportsRes = await manager.query(
        'DELETE FROM reports WHERE lab_id = $1',
        [labId],
      );

      // 3. Cascade delete billing invoices
      await manager.query(
        'DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE lab_id = $1)',
        [labId],
      );
      const invoicesRes = await manager.query(
        'DELETE FROM invoices WHERE lab_id = $1',
        [labId],
      );

      // 4. Cascade delete collection requests & samples
      await manager.query(
        'DELETE FROM collection_samples WHERE collection_id IN (SELECT id FROM collection_requests WHERE lab_id = $1)',
        [labId],
      );
      const collectionsRes = await manager.query(
        'DELETE FROM collection_requests WHERE lab_id = $1',
        [labId],
      );

      // 5. Cascade delete patients and notification logs
      await manager.query(
        'DELETE FROM notification_logs WHERE lab_id = $1',
        [labId],
      );
      const patientsRes = await manager.query(
        'DELETE FROM patients WHERE lab_id = $1',
        [labId],
      );

      const reportsCount = typeof reportsRes?.[1] === 'number' ? reportsRes[1] : 0;
      const invoicesCount = typeof invoicesRes?.[1] === 'number' ? invoicesRes[1] : 0;
      const patientsCount = typeof patientsRes?.[1] === 'number' ? patientsRes[1] : 0;
      const collectionsCount = typeof collectionsRes?.[1] === 'number' ? collectionsRes[1] : 0;

      this.logger.warn(
        `[PILOT DATA PURGE] Lab: ${labId} (${labName}) | Purged by Super Admin: ${adminEmail} | Reports: ${reportsCount}, Invoices: ${invoicesCount}, Patients: ${patientsCount}`,
      );

      return {
        success: true,
        labId,
        deletedCounts: {
          reports: reportsCount,
          invoices: invoicesCount,
          patients: patientsCount,
          collections: collectionsCount,
        },
        purgedAt: new Date().toISOString(),
      };
    });
  }
}
