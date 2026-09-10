import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutsourcedTestsTable1710000004003 implements MigrationInterface {
  name = 'CreateOutsourcedTestsTable1710000004003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outsourced_tests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "report_id" uuid NOT NULL,
        "test_name" text NOT NULL,
        "reference_lab_name" text NOT NULL,
        "status" smallint NOT NULL DEFAULT 0,
        "cost" numeric(10,2),
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "received_at" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_outsourced_tests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_outsourced_tests_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_outsourced_tests_report_id" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_outsourced_tests_lab_id_report_id" ON "outsourced_tests" ("lab_id", "report_id");
      CREATE INDEX IF NOT EXISTS "IDX_outsourced_tests_lab_id_status" ON "outsourced_tests" ("lab_id", "status");
      CREATE INDEX IF NOT EXISTS "IDX_outsourced_tests_lab_id_ref_lab" ON "outsourced_tests" ("lab_id", "reference_lab_name");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "outsourced_tests";
    `);
  }
}
