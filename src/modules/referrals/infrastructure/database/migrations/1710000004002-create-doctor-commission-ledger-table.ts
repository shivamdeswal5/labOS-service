import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorCommissionLedgerTable1710000004002 implements MigrationInterface {
  name = 'CreateDoctorCommissionLedgerTable1710000004002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctor_commission_ledger" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "doctor_id" uuid NOT NULL,
        "report_id" uuid,
        "amount" numeric(10,2) NOT NULL DEFAULT 0,
        "status" smallint NOT NULL DEFAULT 0,
        "settled_at" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_doctor_commission_ledger_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_commission_ledger_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_commission_ledger_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "referring_doctors"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_commission_ledger_report_id" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS "IDX_commission_ledger_lab_id_doctor_id" ON "doctor_commission_ledger" ("lab_id", "doctor_id");
      CREATE INDEX IF NOT EXISTS "IDX_commission_ledger_lab_id_status" ON "doctor_commission_ledger" ("lab_id", "status");
      CREATE INDEX IF NOT EXISTS "IDX_commission_ledger_lab_id_report_id" ON "doctor_commission_ledger" ("lab_id", "report_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "doctor_commission_ledger";
    `);
  }
}
