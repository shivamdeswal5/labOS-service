import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceItemsTable1710000005002 implements MigrationInterface {
  name = 'CreateInvoiceItemsTable1710000005002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "invoice_id" uuid NOT NULL,
        "description" text NOT NULL,
        "unit_price" numeric(10,2) NOT NULL DEFAULT 0,
        "quantity" integer NOT NULL DEFAULT 1,
        "total" numeric(10,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_invoice_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoice_items_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_invoice_items_invoice_id" ON "invoice_items" ("invoice_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "invoice_items";
    `);
  }
}
