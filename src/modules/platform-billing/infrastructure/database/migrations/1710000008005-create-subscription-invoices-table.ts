import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionInvoicesTable1710000008005 implements MigrationInterface {
  name = 'CreateSubscriptionInvoicesTable1710000008005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_invoices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "invoice_number" varchar(50) NOT NULL,
        "lab_id" uuid NOT NULL,
        "payment_id" uuid NOT NULL,
        "amount_inr" numeric(10,2) NOT NULL,
        "tax_amount_inr" numeric(10,2) NOT NULL DEFAULT 0.00,
        "subtotal_inr" numeric(10,2) NOT NULL,
        "customer_gstin" varchar(20),
        "billing_period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
        "billing_period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
        "pdf_url" text,
        "status" varchar(30) NOT NULL DEFAULT 'PAID',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_invoices_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscription_invoices_invoice_number" UNIQUE ("invoice_number"),
        CONSTRAINT "FK_subscription_invoices_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_subscription_invoices_payment_id" FOREIGN KEY ("payment_id") REFERENCES "platform_payments"("id") ON DELETE RESTRICT
      );

      CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_lab_id" ON "subscription_invoices" ("lab_id");
      CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_invoice_number" ON "subscription_invoices" ("invoice_number");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "subscription_invoices";
    `);
  }
}
