import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoicesTable1710000005001 implements MigrationInterface {
  name = 'CreateInvoicesTable1710000005001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "report_id" uuid,
        "invoice_number" varchar(50) NOT NULL,
        "subtotal" numeric(10,2) NOT NULL DEFAULT 0,
        "discount" numeric(10,2) NOT NULL DEFAULT 0,
        "total_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "paid_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "payment_status" smallint NOT NULL DEFAULT 0,
        "payment_method" smallint,
        "paid_at" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_invoices_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoices_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_invoices_patient_id" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_invoices_report_id" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE SET NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invoices_lab_id_invoice_number" ON "invoices" ("lab_id", "invoice_number");
      CREATE INDEX IF NOT EXISTS "IDX_invoices_lab_id_patient_id" ON "invoices" ("lab_id", "patient_id");
      CREATE INDEX IF NOT EXISTS "IDX_invoices_lab_id_report_id" ON "invoices" ("lab_id", "report_id");
      CREATE INDEX IF NOT EXISTS "IDX_invoices_lab_id_payment_status" ON "invoices" ("lab_id", "payment_status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "invoices";
    `);
  }
}
