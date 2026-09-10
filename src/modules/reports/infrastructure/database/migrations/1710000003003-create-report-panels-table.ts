import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportPanelsTable1710000003003 implements MigrationInterface {
  name = 'CreateReportPanelsTable1710000003003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "report_panels" (
        "report_id" uuid NOT NULL,
        "panel_id" uuid NOT NULL,
        CONSTRAINT "PK_report_panels" PRIMARY KEY ("report_id", "panel_id"),
        CONSTRAINT "FK_report_panels_report_id" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_report_panels_panel_id" FOREIGN KEY ("panel_id") REFERENCES "test_panels"("id") ON DELETE RESTRICT
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "report_panels";
    `);
  }
}
