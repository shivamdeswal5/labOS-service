import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportAmendmentsTable1710000003005 implements MigrationInterface {
  name = 'CreateReportAmendmentsTable1710000003005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "report_amendments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "report_id" uuid NOT NULL,
        "amended_by" uuid NOT NULL,
        "reason" text NOT NULL,
        "previous_data" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_report_amendments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_report_amendments_report_id" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "report_amendments";
    `);
  }
}
