import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpensesTable1710000005003 implements MigrationInterface {
  name = 'CreateExpensesTable1710000005003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "category" smallint NOT NULL,
        "title" text NOT NULL,
        "amount" numeric(10,2) NOT NULL DEFAULT 0,
        "expense_date" date NOT NULL,
        "payment_method" smallint NOT NULL DEFAULT 0,
        "vendor" text,
        "vendor_invoice_number" varchar(100),
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_expenses_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_expenses_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_expenses_lab_id_expense_date" ON "expenses" ("lab_id", "expense_date");
      CREATE INDEX IF NOT EXISTS "IDX_expenses_lab_id_category" ON "expenses" ("lab_id", "category");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "expenses";
    `);
  }
}
