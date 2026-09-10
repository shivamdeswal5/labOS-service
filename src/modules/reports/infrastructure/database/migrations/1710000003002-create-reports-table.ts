import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportsTable1710000003002 implements MigrationInterface {
  name = 'CreateReportsTable1710000003002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "report_number" varchar(50) NOT NULL,
        "ref_by_doctor_id" uuid,
        "status" smallint NOT NULL DEFAULT 0,
        "sample_status" smallint NOT NULL DEFAULT 0,
        "rejection_reason" text,
        "sample_collected_at" TIMESTAMP WITH TIME ZONE,
        "results_entered_at" TIMESTAMP WITH TIME ZONE,
        "finalized_at" TIMESTAMP WITH TIME ZONE,
        "delivered_at" TIMESTAMP WITH TIME ZONE,
        "remarks" text,
        "share_token" varchar(64) NOT NULL,
        "share_expires_at" TIMESTAMP WITH TIME ZONE,
        "pdf_url" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_reports_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_reports_share_token" UNIQUE ("share_token"),
        CONSTRAINT "FK_reports_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_patient_id" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reports_lab_id_report_number" ON "reports" ("lab_id", "report_number");
      CREATE INDEX IF NOT EXISTS "IDX_reports_lab_id_patient_id" ON "reports" ("lab_id", "patient_id");
      CREATE INDEX IF NOT EXISTS "IDX_reports_lab_id_status" ON "reports" ("lab_id", "status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "reports";
    `);
  }
}
